import re

files_to_patch = ['src/pages/Events.tsx', 'src/pages/CommitteesEvents.tsx']

step8_component = """
function Step8Attachments({ evt, updateEventWorkflow }: { evt: any, updateEventWorkflow: (id: number, updates: any) => void }) {
  const [attendanceFile, setAttendanceFile] = React.useState<File | string | null>(evt.attendanceListUrl || null);
  const [minutesFile, setMinutesFile] = React.useState<File | string | null>(evt.approvedMinutesUrl || null);
  const [otherFile, setOtherFile] = React.useState<File | string | null>(evt.otherAttachmentsUrl || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [xLink, setXLink] = React.useState(evt.xLink || "");
  const [linkedinLink, setLinkedinLink] = React.useState(evt.linkedinLink || "");
  const [instagramLink, setInstagramLink] = React.useState(evt.instagramLink || "");

  const isComplete = attendanceFile && minutesFile;

  const handleFinalSave = async () => {
    try {
      setIsUploading(true);
      let finalAttendance = evt.attendanceListUrl;
      let finalMinutes = evt.approvedMinutesUrl;
      let finalOthers = evt.otherAttachmentsUrl;

      const uploadAttachment = async (file: File | string | null, fileName: string, targetFolderId: string) => {
        if (file && typeof file === "object" && "name" in file) {
          const ext = (file as any).name.split('.').pop();
          const fullFileName = `${fileName}.${ext}`;
          const base64 = await readFileAsBase64(file as any);
          
          const { uploadBinaryFileToDrive } = await import("../lib/googleApi");
          const res = await uploadBinaryFileToDrive(fullFileName, base64 as string, (file as any).type || "application/octet-stream", targetFolderId);
          return res && res.id ? `https://drive.google.com/file/d/${res.id}/view` : fullFileName;
        }
        return typeof file === "string" ? file : "";
      };

      const hasFilesToUpload = (attendanceFile && typeof attendanceFile === "object") || 
                               (minutesFile && typeof minutesFile === "object") ||
                               (otherFile && typeof otherFile === "object");

      if (hasFilesToUpload) {
        showGlobalToast("جاري معالجة ورفع المرفقات إلى Google Drive...", "loading");
        
        const { getOrCreateFolder } = await import("../lib/googleApi");
        const rootFolderId = await getOrCreateFolder("تقرير اللجان للدورة الـ 22");
        const approvedFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        const committeeFolderId = await getOrCreateFolder(evt.committeeName || "عام", approvedFolderId);
        const eventsFolderId = await getOrCreateFolder("الفعاليات", committeeFolderId);
        
        let eventTitle = evt.eventName || evt.title || "بدون عنوان";
        let eventKind = "فعاليات أخرى";
        if (eventTitle.includes("اجتماع")) eventKind = "الاجتماعات";
        else if (eventTitle.includes("لقاء")) eventKind = "اللقاءات";
        else if (eventTitle.includes("زيارة")) eventKind = "الزيارات";
        else if (eventTitle.includes("ورشة عمل")) eventKind = "ورش العمل";
        
        const kindFolderId = await getOrCreateFolder(eventKind, eventsFolderId);
        const eventFolderId = await getOrCreateFolder(eventTitle, kindFolderId);

        if (attendanceFile && typeof attendanceFile === "object") {
          finalAttendance = await uploadAttachment(attendanceFile, `كشف حضور ${eventTitle}`, eventFolderId);
        }
        if (minutesFile && typeof minutesFile === "object") {
          finalMinutes = await uploadAttachment(minutesFile, `محضر ${eventTitle} المعتمد`, eventFolderId);
        }
        if (otherFile && typeof otherFile === "object") {
          finalOthers = await uploadAttachment(otherFile, `مرفقات أخرى لـ ${eventTitle}`, eventFolderId);
        }
      }

      updateEventWorkflow(evt.id, { 
        evidencesSaved: true, 
        status: "منتهية",
        attendanceListUrl: finalAttendance,
        approvedMinutesUrl: finalMinutes,
        otherAttachmentsUrl: finalOthers,
        xLink,
        linkedinLink,
        instagramLink
      });
      showGlobalToast("تم حفظ المرفقات بنجاح! تم تحويل الفعالية إلى منجزة.", "success");
    } catch (error: any) {
      console.error("Upload failed", error);
      showGlobalToast("فشل رفع المرفقات: " + (error.message || "خطأ غير معروف"), "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-brand" />
          المرفقات والشواهد الختامية
        </h3>
        <span className="text-[9px] text-gray-500 font-bold">مرحلة 8 من 8</span>
      </div>

      <p className="text-[10px] text-gray-550 leading-relaxed font-bold">
        يرجى إرفاق روابط المستندات المطلوبة عبر جوجل درايف. (كشف الحضور ومحضر الاجتماع إلزامية).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-1.5">
          <AttachmentInput
            id={`attendance-${evt.id}`}
            label="كشف الحضور (إلزامي) *"
            value={attendanceFile}
            onChange={(val) => setAttendanceFile(val)}
          />
        </div>
        <div className="space-y-1.5">
          <AttachmentInput
            id={`minutes-${evt.id}`}
            label="محضر الاجتماع المعتمد (إلزامي) *"
            value={minutesFile}
            onChange={(val) => setMinutesFile(val)}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-bold text-gray-700">رابط منصة X (اختياري)</label>
          <input
            type="url"
            value={xLink}
            onChange={e => setXLink(e.target.value)}
            placeholder="https://x.com/..."
            className="w-full text-[10px] p-2 border border-gray-200 rounded-lg focus:ring-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-bold text-gray-700">رابط منصة Linkedin (اختياري)</label>
          <input
            type="url"
            value={linkedinLink}
            onChange={e => setLinkedinLink(e.target.value)}
            placeholder="https://linkedin.com/..."
            className="w-full text-[10px] p-2 border border-gray-200 rounded-lg focus:ring-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-bold text-gray-700">رابط منصة Instagram (اختياري)</label>
          <input
            type="url"
            value={instagramLink}
            onChange={e => setInstagramLink(e.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full text-[10px] p-2 border border-gray-200 rounded-lg focus:ring-brand"
          />
        </div>

        <div className="space-y-1.5">
          <AttachmentInput
            id={`other-${evt.id}`}
            label="مرفقات أخرى (اختياري)"
            value={otherFile}
            onChange={(val) => setOtherFile(val)}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          disabled={!isComplete || isUploading}
          onClick={handleFinalSave}
          className={`px-5 py-2.5 rounded-lg text-[10.5px] font-black flex items-center gap-2 transition-all ${
            (isComplete && !isUploading)
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {isUploading ? "جاري الرفع..." : "حفظ وإحالة إلى منجز"}
        </button>
      </div>
    </div>
  );
}
"""

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Inject the Step8Attachments function before the main default export component
    if "function Step8Attachments" not in content:
        # Find the line before `export default function `
        content = re.sub(r'(export default function)', step8_component + r'\n\n\1', content, count=1)
    
    # 2. Replace case 7 content with <Step8Attachments />
    case7_replacement = """                                      case 7: { // Step 8: Attachments and Evidences
                                        return <Step8Attachments evt={evt} updateEventWorkflow={updateEventWorkflow} />;
                                      }"""
    
    pattern = r'case 7: \{ // Step 8: Attachments and Evidences.*?(?=\s+default: return null;)'
    content = re.sub(pattern, case7_replacement, content, flags=re.DOTALL)
    
    # Also we need to make sure we don't have typescript errors with missing imports for readFileAsBase64, showGlobalToast
    # So we'll pass them down or ensure they are accessible.
    # Wait, showGlobalToast is imported at top level. readFileAsBase64 is NOT.
    # Let's add readFileAsBase64 inside Step8Attachments if not present, but it might already exist in the file.
    
    with open(filepath, 'w') as f:
        f.write(content)
