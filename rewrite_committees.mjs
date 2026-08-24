import fs from 'fs';

let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// 1. Add getPdfBlob to CommitteesLibrary component.
const handleDownloadPDFMatch = code.match(/const handleDownloadPDF = async \(\) => \{[\s\S]*?pdf\.save\([^)]+\);\s*showGlobalToast\([^)]+\);\s*\} catch \(e\) \{\s*console\.error\(e\);\s*\}\s*\};/);

if (handleDownloadPDFMatch && !code.includes('const getPdfBlob')) {
  const getPdfBlobCode = `
  const getPdfBlob = async (): Promise<Blob | null> => {
    if (!circularPrintRef.current) return null;
    try {
      const el = circularPrintRef.current;
      const dataUrl = await toPng(el, { 
        cacheBust: true, 
        backgroundColor: '#FFFFFF', 
        pixelRatio: 3,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (el.offsetHeight * pdfWidth) / el.offsetWidth;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const yOffset = pdfHeight < pageHeight ? (pageHeight - pdfHeight) / 2 : 0;
      
      pdf.addImage(dataUrl, 'PNG', 0, yOffset, pdfWidth, pdfHeight);

      const links = el.querySelectorAll('[data-pdf-link]');
      const containerRect = el.getBoundingClientRect();
      
      links.forEach((link) => {
        const url = link.getAttribute('data-pdf-link');
        if (!url || url === '#') return;
        
        const rect = link.getBoundingClientRect();
        
        const rx = (rect.left - containerRect.left) / containerRect.width;
        const ry = (rect.top - containerRect.top) / containerRect.height;
        const rw = rect.width / containerRect.width;
        const rh = rect.height / containerRect.height;
        
        const pdfX = rx * pdfWidth;
        const pdfY = yOffset + (ry * pdfHeight);
        const pdfW = rw * pdfWidth;
        const pdfH = rh * pdfHeight;
        
        pdf.link(pdfX, pdfY, pdfW, pdfH, { url });
      });
      
      return pdf.output('blob');
    } catch (e) {
      console.error(e);
      return null;
    }
  };
`;
  code = code.replace(handleDownloadPDFMatch[0], getPdfBlobCode + '\n' + handleDownloadPDFMatch[0]);
}

const altSaveAI = code.match(/const saveAIGeneratedLetter = async \(\) => \{[\s\S]*?alert\("حدث خطأ أثناء الحفظ. الرجاء المحاولة مجدداً.", "error"\);\s*\}\s*\};/);

if(altSaveAI) {
    const newSaveAICode = `const saveAIGeneratedLetter = async () => {
    try {
      const stored = localStorage.getItem("current_user");
      let currentUser = null;
      if (stored) currentUser = JSON.parse(stored);
      
      const creatorName = currentUser ? currentUser.name : "الأخصائي";
      const targetCommittees = committees.filter(c => aiGenCommittees.includes(String(c.id)));

      if (targetCommittees.length === 0) {
        alert("لم يتم العثور على لجان للحفظ فيها.");
        return;
      }

      const isCircular = workspaceService === "circular";
      const finalType = isCircular ? "تعميم" : aiGenTemplateType.replace(/\\s*\\(.*\\)/, "").trim();
      const subjectName = aiGenSubject || circularSubject || "تعميم جديد";
      
      let pdfBlob: Blob | null = null;
      if (isCircular) {
          pdfBlob = await getPdfBlob();
      }
      
      const committeeUrls: any[] = [];
      let lastCloudUrl = "#";
      let lastTemplateText = "";

      for (const committee of targetCommittees) {
        const committeeName = committee.name;
        
        let finalDocumentText = aiGenGeneratedText;
        if (isCircular) {
            const circularBody = aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText;
            finalDocumentText = \`تعميم إداري\\nاللجنة: \${committeeName}\\nرقم التعميم: \${circularOutNumber}\\nالتاريخ: \${circularOutDate}\\nالوارد من: \${circularIncomingFrom || "—"}\\nبرقم: \${circularIncomingNumber || "—"} وتاريخ: \${circularIncomingDate || "—"}\\nالموضوع: \${circularSubject || "—"}\\n\\n\${circularBody}\\n\\nللتواصل: \${circularContactName || "—"}\\nجوال: \${circularContactPhone || "—"}\\nبريد: \${circularContactEmail || "—"}\`;
        }
        
        let finalCloudUrl = "#";
        let folderCloudUrl = "#";

        if (finalType === "مستندات" || isCircular) {
          try {
            const folderPath = isCircular ? \`تقرير اللجان للدورة الـ 22/اللجان المعتمدة/\${committeeName}/التعاميم/\${subjectName}\` : \`تقرير اللجان للدورة الـ 22/اللجان المعتمدة/\${committeeName}/الخطابات/مسودات/\${subjectName}\`;
            const folderId = await resolveDrivePath(folderPath);
            folderCloudUrl = \`https://drive.google.com/drive/folders/\${folderId}\`;
            
            const { documentId, documentUrl } = await createGoogleDoc(subjectName, finalDocumentText);
            await moveDriveFile(documentId, folderId);
            finalCloudUrl = documentUrl;
            
            if (isCircular) {
               if (pdfBlob) {
                   const pdfFile = new File([pdfBlob], \`تعميم_\${circularOutNumber.replace(/[\\/\\\\]/g, '-')}.pdf\`, { type: 'application/pdf' });
                   const uploadedPdfUrl = await uploadFileToDriveByPath(pdfFile, folderPath, pdfFile.name);
                   if (uploadedPdfUrl) finalCloudUrl = uploadedPdfUrl;
               }
               if (circularMainFile && typeof circularMainFile === 'object') await uploadFileToDriveByPath(circularMainFile as File, folderPath, (circularMainFile as File).name);
               if (circularAtt1 && typeof circularAtt1 === 'object') await uploadFileToDriveByPath(circularAtt1 as File, folderPath, (circularAtt1 as File).name);
            }
          } catch (apiError) {
            console.error("Google API Error:", apiError);
          }
        }
        
        lastCloudUrl = finalCloudUrl;
        lastTemplateText = finalDocumentText;
        
        committeeUrls.push({
            committeeId: committee.id,
            committeeName: committee.name,
            documentUrl: finalCloudUrl,
            folderUrl: folderCloudUrl
        });
      }
      
      const urlAttachments = [];
      if (typeof circularMainFile === 'string') urlAttachments.push(circularMainFile);
      if (typeof circularAtt1 === 'string') urlAttachments.push(circularAtt1);

      const combinedCommitteesName = targetCommittees.map(c => c.name).join(' و ');
      
      const newDoc = {
        title: subjectName,
        description: isCircular ? \`مجلد تعاميم | لجان: \${combinedCommitteesName} | موضوع: \${circularSubject || ""}\` : \`مجلد خطابات - مجلد مسودات | لجان: \${combinedCommitteesName} | صادر إلى: \${aiGenRecipientName}\`,
        type: finalType,
        creator: creatorName,
        cloudUrl: lastCloudUrl, // For download button
        downloadUrl: lastCloudUrl, // For download button
        lastUpdated: new Date().toISOString().split('T')[0],
        isFavorite: false,
        templateText: lastTemplateText,
        committeeId: targetCommittees[0].id || "", // legacy
        targetCommitteesList: targetCommittees.map(c => ({id: c.id, name: c.name})),
        committeeUrls: committeeUrls,
        attachments: urlAttachments,
      };
      
      await addDoc(collection(db, "templates"), newDoc);
      
      alert(targetCommittees.length > 1 ? \`تم حفظ التعميم بنجاح لعدد \${targetCommittees.length} من اللجان.\` : "تم حفظ التعميم بنجاح.");
      setIsAIGenOpen(false);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ. الرجاء المحاولة مجدداً.", "error");
    }
  };`;
    code = code.replace(altSaveAI[0], newSaveAICode);
}

// 2. Add state for cloud open select
if (!code.includes('const [cloudSelectOpen, setCloudSelectOpen]')) {
    code = code.replace(/const \[exportSelectedIds, setExportSelectedIds\] = useState<string\[\]>\(\[\]\);/, `const [exportSelectedIds, setExportSelectedIds] = useState<string[]>([]);\n  const [cloudSelectOpen, setCloudSelectOpen] = useState<string | null>(null);\n  const [circularDetailsOpen, setCircularDetailsOpen] = useState<any>(null);\n`);
}

// 3. Update the buttons in the map.
// Let's replace the buttons in the card view.
const buttonBlockRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-gray-200\/60">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>/;
const matchCardButtons = code.match(buttonBlockRegex);
if(matchCardButtons) {
    const newButtons = `<div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-gray-200/60">
                    <div className="relative">
                      {t.committeeUrls && t.committeeUrls.length > 1 ? (
                        <>
                            <button
                                onClick={() => setCloudSelectOpen(cloudSelectOpen === t.id ? null : t.id)}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-extrabold transition-colors border border-blue-200 shadow-sm"
                            >
                                فتح سحابي
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            {cloudSelectOpen === t.id && (
                                <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-1 flex flex-col gap-1">
                                    {t.committeeUrls.map((cu: any) => (
                                        <a key={cu.committeeId} href={cu.folderUrl || cu.documentUrl} target="_blank" rel="noopener noreferrer" className="block px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded text-right whitespace-nowrap overflow-hidden text-ellipsis font-bold" onClick={() => setCloudSelectOpen(null)}>
                                            {cu.committeeName}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                      ) : (
                        <a
                          href={t.committeeUrls?.[0]?.folderUrl || t.cloudUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-extrabold transition-colors border border-blue-200 shadow-sm"
                        >
                          فتح سحابي
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <a
                      href={t.cloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-750 hover:text-black hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                      title="تحميل مباشرة"
                    >
                      تحميل
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => t.type === "خطاب ذكي" ? openFillSmartLetter(t) : (t.type === "تعميم" ? setCircularDetailsOpen(t) : handleOpenAI(t))}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white hover:brightness-110 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                      title={t.type === "خطاب ذكي" ? "تعبئة المتغيرات وطباعة الخطاب" : (t.type === "تعميم" ? "تفاصيل التعميم" : "المولد الذكي للخطابات والتعاميم")}
                    >
                      {t.type === "خطاب ذكي" ? "تعبئة وطباعة" : (t.type === "تعميم" ? "التفاصيل" : "توليد ذكي")}
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>`;
          
    code = code.replace(matchCardButtons[0], newButtons);
} else {
    console.log("Could not find button block for cards");
}

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("Done rewriting CommitteesLibrary");
