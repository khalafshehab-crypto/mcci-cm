import re

with open('src/pages/CommitteesRecommendations.tsx', 'r') as f:
    content = f.read()

# We need to find the block starting with `<div className="flex gap-1">` and containing `توليد الصياغة الفنية الذكية`
# It's inside a `<div className="flex justify-between items-center">` at line 2963.
regex = re.compile(r'(<div className="flex gap-1">)([\s\S]*?)توليد الصياغة الفنية الذكية[\s\S]*?</button>\s*</div>', re.MULTILINE)

new_buttons = """<button
  type="button"
  onClick={() => {
    const dayArabic = getDayNameFromDate(evt.date) || "الاثنين";
    const attachmentsText = attachmentsList && attachmentsList.length > 0 ? attachmentsList.map((a: any) => a.name).join(", ") : "لا يوجد مرفقات";
    const linkedEvent = events.find(e => String(e.id) === String(evt.recommendationEventId));
    const meetingName = linkedEvent ? linkedEvent.title : (evt.eventName && evt.eventName !== "توصية غير محددة" ? evt.eventName : (evt.title.includes("اجتماع") ? evt.title : `اجتماع ${evt.committeeName || "اللجنة"}`));
    const eventTime = linkedEvent?.time || evt.time || "……";
    const eventLocation = linkedEvent?.location || evt.location || "……";
    const dateStr = linkedEvent?.date || evt.date || "……";
    let formattedTime = eventTime;
    if (eventTime && eventTime !== "……") {
        const [hours, minutes] = eventTime.split(":");
        if (hours && minutes) {
          let h = parseInt(hours, 10);
          const ampm = h >= 12 ? "مساءً" : "صباحاً";
          h = h % 12;
          h = h ? h : 12;
          formattedTime = `${h}:${minutes} ${ampm}`;
        }
    }
    let formattedDate = dateStr;
    if (dateStr && dateStr !== "……") {
        const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const dayStr = d.getDate().toString().padStart(2, '0');
            const monthStr = months[d.getMonth()];
            const yearStr = d.getFullYear();
            formattedDate = `${dayStr} ${monthStr} ${yearStr}م`;
        }
    }
    let itemTitleFull = `البند: ${evt.title || "……"}`;
    let itemDiscussion = evt.recommendationDiscussion || "……";
    let itemRec = evt.description || evt.recommendationText || evt.notes || "لا يوجد نص للتوصية";
    let assigneeText = evt.recommendationAssignee || (evt.employees && evt.employees.length > 0 ? evt.employees[0] : "غير محدد");
    
    // Resolve specialist
    if (assigneeText === "الأخصائي" || assigneeText === "أخصائي اللجنة") {
        const committeeIdMatch = evt.committeeId || (events.find(e => String(e.id) === String(evt.recommendationEventId))?.committeeId);
        const comm = committees.find(c => c.name === evt.committeeName || (committeeIdMatch && String(c.id) === String(committeeIdMatch)));
        if (comm && comm.specialist) {
            assigneeText = `أخصائي اللجنة: ${comm.specialist}`;
        }
    }

    let attachmentsLabel = attachmentsText;
    if (attachmentsList && attachmentsList.length > 0) {
        attachmentsLabel = attachmentsList.map((a: any) => a.name).join("، ");
    } else {
        attachmentsLabel = "لا يوجد مرفقات";
    }

    const isUrgent = !!evt.isUrgent;
    const isImportant = !!evt.isImportant;
    const impactType = evt.impactType || "عادية";
    
    const subjectPrefix = (isImportant && isUrgent) ? "(هام وعاجل) " : (isImportant ? "(هام) " : (isUrgent ? "(عاجل) " : ""));
    const subjectText = `${subjectPrefix}تفعيل توصية ${itemTitleFull} ل${meetingName}`;
    
    let closureText = "آمل من سعادتكم التكرم بالاطلاع والتوجيه حتى يتسنى لنا إكمال اللازم.";
    if (impactType === "آجل") {
        closureText = "آمل من سعادتكم التكرم بالاطلاع للعلم والإحاطة.";
    }

    const generatedProposal = `الموضوع: ${subjectText}

سعادة الأستاذ/ محمد بن محسن السبيعي                 سلمه الله
رئيس قسم اللجان
السلام عليكم ورحمه الله وبركاته .. وبعد
نهديكم أطيب تحية وتقدير.. ونشكر لسعادتكم تعاونكم الدائم والمستمر لإنجاح سير أعمال إدارة اللجان.
إشارة إلى ${meetingName} الذي تم عقده في تمام الساعة ${formattedTime} من ظهر يوم ${dayArabic} بتاريخ ${formattedDate} بقاعة/ ${eventLocation}  بمقر غرفة مكة المكرمة، وما ورد به من:
${itemTitleFull} .
المناقشة: ${itemDiscussion} .
التوصية: ${itemRec} .
المكلف: ${assigneeText} .
المرفقات: ${attachmentsLabel} .

${closureText}

شاكرين ومقدرين لسعادتكم حسن تعاونكم..
وتفضلوا بقبول وافر التحية والتقدير،،،`;

    updateEventWorkflow(evt.id, { preparationsText: generatedProposal });
  }}
  className="px-2 py-1 bg-slate-900 border-transparent hover:bg-slate-800 text-brand rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow transition-all duration-200 font-sans text-[9px] font-black"
  title="توليد النص المقترح بناءً على نوع التوصية"
>
  <Sparkles className="w-3.5 h-3.5" />
  المولد الذكي للتوصيات
</button>

<button
  type="button"
  onClick={() => {
    const text = evt.preparationsText || evt.description || evt.recommendationText || "";
    if (text) {
        try { 
            navigator.clipboard.writeText(text); 
            if (typeof setAlertState === 'function') {
                setAlertState({ isOpen: true, message: "تم نسخ الصياغة المقترحة بنجاح!", onClose: () => {} });
            } else {
                alert("تم النسخ بنجاح!");
            }
        } catch(e) {}
    } else {
        alert("الرجاء التوليد الذكي أولاً");
    }
  }}
  className="px-2 py-1 bg-slate-100 border border-gray-200 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 font-sans text-[9px] font-black"
  title="نسخ نص التوصية"
>
  <Copy className="w-3.5 h-3.5" />
  نسخ
</button>

<button
  type="button"
  onClick={() => {
    if (!evt.preparationsText) {
        alert("الرجاء التوليد الذكي أولاً");
        return;
    }
    let mailSubject = `تفعيل ${evt.title || "توصية قطاعية"}`;
    let mailBody = evt.preparationsText || "";
    if (mailBody.includes("سعادة")) {
        mailBody = mailBody.substring(mailBody.indexOf("سعادة"));
    } else if (mailBody.startsWith("الموضوع: ")) {
        const firstLineEnd = mailBody.indexOf("\\n");
        if (firstLineEnd !== -1) {
            mailBody = mailBody.substring(firstLineEnd + 1).trim();
        }
    }
    
    const atts = evt.attachments || [];
    let allAtts = [...atts];
    if (evt.approvedMinutesUrl && typeof evt.approvedMinutesUrl === 'string') {
        if (!allAtts.some(a => a.url === evt.approvedMinutesUrl)) {
             allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.approvedMinutesUrl });
        }
    }
    if (evt.agendaMinutes && typeof evt.agendaMinutes === 'string') {
        if (!allAtts.some(a => a.url === evt.agendaMinutes)) {
             allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.agendaMinutes });
        }
    }
    if (allAtts.length > 0) {
        mailBody += "\\n\\nالمرفقات:\\n";
        allAtts.forEach((a, idx) => {
            mailBody += `${idx + 1}- ${a.name || "مرفق"}: ${a.url || ""}\\n`;
        });
    }
    const fullUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
    
    if (fullUrl.length > 7500) {
        navigator.clipboard.writeText(mailBody).then(() => {
            showGlobalToast("نظراً لطول محتوى الرسالة، تم نسخ المحتوى للحافظة. يرجى الضغط على لصق (Ctrl+V) في مساحة النص بالبريد.", "success");
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(mailSubject)}&body=`;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.click();
            }, 2000);
        });
    } else {
        const a = document.createElement('a');
        a.href = fullUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
    }
  }}
  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer flex items-center justify-center transition-all border border-gray-200 font-sans text-[9px] font-black gap-1.5"
  title="إرسال عبر البريد الإلكتروني"
>
  <Mail className="w-3.5 h-3.5" />
  البريد الإلكتروني
</button>
</div>"""

match = regex.search(content)
if not match:
    print("Could not find the target block to replace!")
else:
    new_content = content[:match.start()] + match.group(1) + "\n" + new_buttons + content[match.end():]
    with open('src/pages/CommitteesRecommendations.tsx', 'w') as f:
        f.write(new_content)
    print("Successfully replaced the buttons block.")
