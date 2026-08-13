const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Inject handleAutoFillMinutesFromAgenda
  const injectionPoint = '  // Generate dynamic invitation template text';
  
  const functionCode = `  const [isAutoFillingMinutes, setIsAutoFillingMinutes] = useState<Record<string, boolean>>({});

  const handleAutoFillMinutesFromAgenda = async (evt: any, checked: boolean) => {
    updateEventWorkflow(evt.id, { agendaTransferred: checked });
    
    if (!checked) return;
    const agenda = evt.agenda || [];
    if (agenda.length === 0) return;

    const agendaMinutesFile = agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null);
    if (!agendaMinutesFile) return;

    setIsAutoFillingMinutes(prev => ({ ...prev, [evt.id]: true }));
    showGlobalToast("جاري استخراج المناقشات والتوصيات تلقائياً...", "info");

    try {
        let fileBase64 = null;
        let mimeType = null;
        if (typeof agendaMinutesFile === 'string') {
            const driveData = await downloadDriveFileBase64(agendaMinutesFile);
            fileBase64 = driveData.base64;
            mimeType = driveData.mimeType;
        } else {
            const reader = new FileReader();
            fileBase64 = await new Promise((resolve) => {
                reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                reader.readAsDataURL(agendaMinutesFile as File);
            });
            mimeType = (agendaMinutesFile as File).type;
        }

        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id مع الـ id المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";

        const response = await fetch('/api/gemini/extract-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, fileBase64, mimeType })
        });

        if (!response.ok) {
            const errData = await response.json();
            const errMsg = errData.details || errData.error || "خطأ مجهول";
            if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                throw new Error("عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية.");
            } else {
                throw new Error(errMsg);
            }
        }
        
        const responseData = await response.json();
        const aiText = responseData.result || "";
        const jsonMatch = aiText.match(/\\[.*\\]/s);
        if (jsonMatch) {
            const parsedItems = JSON.parse(jsonMatch[0]);
            const updatedAgenda = agenda.map((item: any) => {
                const filledData = parsedItems.find((p: any) => String(p.id) === String(item.id));
                if (filledData) {
                    return {
                        ...item,
                        discussion: filledData.discussion || item.discussion || "",
                        recommendation: filledData.recommendation || item.recommendation || "",
                        assignee: filledData.assignee || item.assignee || "",
                        durationRec: filledData.durationRec || item.durationRec || ""
                    };
                }
                return item;
            });
            updateEventWorkflow(evt.id, { agenda: updatedAgenda });
            showGlobalToast("تمت تعبئة المناقشات والتوصيات بنجاح", "success");
        } else {
            showGlobalToast("لم يتمكن النظام من استخراج المناقشات، يرجى تعبئتها يدوياً", "error");
        }
    } catch (error: any) {
        console.error(error);
        showGlobalToast(error.message || "حدث خطأ أثناء التعبئة التلقائية", "error");
    } finally {
        setIsAutoFillingMinutes(prev => ({ ...prev, [evt.id]: false }));
    }
  };

  // Generate dynamic invitation template text`;

  if (!content.includes('const [isAutoFillingMinutes')) {
      content = content.replace(injectionPoint, functionCode);
  }

  const oldOnChange = 'onChange={(e) => updateEventWorkflow(evt.id, { agendaTransferred: e.target.checked })}';
  const newOnChange = 'onChange={(e) => handleAutoFillMinutesFromAgenda(evt, e.target.checked)}';
  content = content.replace(oldOnChange, newOnChange);

  const oldStatusSpan = '{evt.agendaTransferred ? (\n															<span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> تم الترحيل للمحضر</span>\n														) : (';
  const newStatusSpan = '{isAutoFillingMinutes[evt.id] ? (\n                                                            <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري التعبئة التلقائية...</span>\n                                                        ) : evt.agendaTransferred ? (\n															<span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> تم الترحيل للمحضر</span>\n														) : (';
  
  content = content.replace(oldStatusSpan, newStatusSpan);

  const oldDisabled = 'disabled={agenda.length === 0}';
  const newDisabled = 'disabled={agenda.length === 0 || isAutoFillingMinutes[evt.id]}';
  content = content.replace(oldDisabled, newDisabled);

  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}
