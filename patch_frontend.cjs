const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  const oldCode = `const response = await fetch('/api/gemini/extract-agenda', {
																				method: 'POST',
																				headers: { 'Content-Type': 'application/json' },
																				body: JSON.stringify({
																					prompt: "استخرج بنود جدول الأعمال كقائمة JSON Array: [{title: string, duration: number, specialist: string}] من هذا المحضر، اذا لم يوجد مدد ضعها 15",
																					fileBase64,
																					mimeType
																				})
																			});`;
  const newCode = `const response = await fetch('/api/gemini/extract-agenda', {
																				method: 'POST',
																				headers: { 'Content-Type': 'application/json' },
																				body: JSON.stringify({
																					prompt: "استخرج بنود جدول الأعمال كقائمة JSON Array: [{title: string, duration: number, specialist: string}] من هذا المحضر، اذا لم يوجد مدد ضعها 15",
																					fileBase64,
																					mimeType
																				})
																			});
                                                                            if (!response.ok) {
                                                                                const errData = await response.json();
                                                                                const errMsg = errData.details || errData.error || "خطأ مجهول";
                                                                                if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                                                                                    throw new Error("عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية من الذكاء الاصطناعي (Quota Exceeded). يرجى المحاولة لاحقاً.");
                                                                                } else {
                                                                                    throw new Error(errMsg);
                                                                                }
                                                                            }`;
  if (content.includes(oldCode)) {
      content = content.replace(oldCode, newCode);
      fs.writeFileSync(file, content);
      console.log('Patched frontend fetch in ' + file);
  } else {
      console.log('Could not find fetch block in ' + file);
  }
}
