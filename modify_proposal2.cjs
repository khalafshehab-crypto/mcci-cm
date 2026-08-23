const fs = require('fs');

function modifyFile(filePath, searchStr, replaceStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Modified ${filePath}`);
}

const searchStr = `const subjectText = \`تفعيل توصية \${itemTitleFull} ل\${meetingName}\`;

const generatedProposal = \`الموضوع: \${subjectText}
سعادة الأستاذ/ محمد بن محسن السبيعي                 سلمه الله
رئيس قسم اللجان
السلام عليكم ورحمه الله وبركاته .. وبعد
نهديكم أطيب تحية وتقدير.. ونشكر لسعادتكم تعاونكم الدائم والمستمر لإنجاح سير أعمال إدارة اللجان.
إشارة إلى \${meetingName} الذي تم عقده في تمام الساعة \${formattedTime} من ظهر يوم \${dayArabic} بتاريخ \${formattedDate} بقاعة/ \${eventLocation}  بمقر غرفة مكة المكرمة، وما ورد به من:
\${itemTitleFull} .
المناقشة: \${itemDiscussion} .
التوصية: \${itemRec} .
المكلف: \${assigneeText} .
المرفقات: \${attachmentsLabel} .

آمل من سعادتكم التكرم بالاطلاع والتوجيه حتى يتسنى لنا إكمال اللازم.

شاكرين ومقدرين لسعادتكم حسن تعاونكم..
وتفضلوا بقبول وافر التحية والتقدير،،،\`;
                                                      
                                                      updateEventWorkflow(evt.id, { preparationsText: generatedProposal });
                                                      try { navigator.clipboard.writeText(generatedProposal); } catch(e) {}
                                                    }}
                                                    className="p-2 bg-slate-900 border-transparent hover:bg-slate-800 text-brand rounded-lg cursor-pointer flex items-center justify-center shadow transition-all duration-200 animate-pulse w-8 h-8"
                                                    title="توليد النص المقترح ونسخه"
                                                  >
                                                    <Copy className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              </div>`;

const replacement = `const subjectPrefix = (evt.isImportant && evt.isUrgent) ? "(هام وعاجل) " : (evt.isImportant ? "(هام) " : (evt.isUrgent ? "(عاجل) " : ""));
const subjectText = \`\${subjectPrefix}تفعيل توصية \${itemTitleFull} ل\${meetingName}\`;

let closureText = "آمل من سعادتكم التكرم بالاطلاع والتوجيه حتى يتسنى لنا إكمال اللازم.";
if (evt.impactType === "آجل") {
    closureText = "آمل من سعادتكم التكرم بالاطلاع للعلم والإحاطة.";
}

const generatedProposal = \`الموضوع: \${subjectText}

سعادة الأستاذ/ محمد بن محسن السبيعي                 سلمه الله
رئيس قسم اللجان
السلام عليكم ورحمه الله وبركاته .. وبعد
نهديكم أطيب تحية وتقدير.. ونشكر لسعادتكم تعاونكم الدائم والمستمر لإنجاح سير أعمال إدارة اللجان.
إشارة إلى \${meetingName} الذي تم عقده في تمام الساعة \${formattedTime} من ظهر يوم \${dayArabic} بتاريخ \${formattedDate} بقاعة/ \${eventLocation}  بمقر غرفة مكة المكرمة، وما ورد به من:
\${itemTitleFull} .
المناقشة: \${itemDiscussion} .
التوصية: \${itemRec} .
المكلف: \${assigneeText} .
المرفقات: \${attachmentsLabel} .

\${closureText}

شاكرين ومقدرين لسعادتكم حسن تعاونكم..
وتفضلوا بقبول وافر التحية والتقدير،،،\`;
                                                      
                                                      updateEventWorkflow(evt.id, { preparationsText: generatedProposal });
                                                    }}
                                                    className="px-2 py-1 bg-slate-900 border-transparent hover:bg-slate-800 text-brand rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow transition-all duration-200 animate-pulse font-sans text-[9px] font-black"
                                                    title="توليد النص المقترح بناءً على نوع التوصية"
                                                  >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    المولد الذكي للتوصيات
                                                  </button>
                                                  
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                        const text = evt.preparationsText || evt.description || evt.recommendationText || "";
                                                        if(text) {
                                                            try { navigator.clipboard.writeText(text); alert("تم النسخ بنجاح!"); } catch(e) {}
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
                                                        if(evt.preparationsText) {
                                                          const body = encodeURIComponent(evt.preparationsText || "");
                                                          const subject = encodeURIComponent(subjectText || "توصية");
                                                          const mailto = \`mailto:?subject=\${subject}&body=\${body}\`;
                                                          if (typeof window !== 'undefined') {
                                                              const a = document.createElement('a');
                                                              a.href = mailto;
                                                              a.target = '_blank';
                                                              a.rel = 'noopener noreferrer';
                                                              a.click();
                                                          }
                                                        } else {
                                                            alert("الرجاء توليد النص أولاً");
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer flex items-center justify-center transition-all border border-gray-200 font-sans text-[9px] font-black gap-1.5"
                                                    title="إرسال عبر البريد الإلكتروني"
                                                  >
                                                    <Mail className="w-3.5 h-3.5" />
                                                    البريد الإلكتروني
                                                  </button>
                                                </div>
                                              </div>`;

modifyFile('src/pages/CommitteesRecommendations.tsx', searchStr, replacement);
modifyFile('src/pages/Recommendations.tsx', searchStr, replacement);
