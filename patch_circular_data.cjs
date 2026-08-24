const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// 1. Clear initial state / wizard reset defaults
content = content.replace(/setCircularIncomingFrom\("اتحاد الغرف السعودية"\);/, 'setCircularIncomingFrom("");');
content = content.replace(/setCircularIncomingNumber\("ACS005681"\);/, 'setCircularIncomingNumber("");');
content = content.replace(/setCircularIncomingDate\("2025-10-12"\);/, 'setCircularIncomingDate("");');
content = content.replace(/setCircularSubject\("دعوة المهتمين للانضمام إلى عضوية مجلس الأعمال السعودي التايلاندي"\);/, 'setCircularSubject("");');
content = content.replace(/setCircularContactName\("الأستاذ \/ محمد الصيعري"\);/, 'setCircularContactName("");');
content = content.replace(/setCircularContactPhone\("0581517644"\);/, 'setCircularContactPhone("");');
content = content.replace(/setCircularContactEmail\("malsaiari@fsc.org.sa"\);/, 'setCircularContactEmail("");');
content = content.replace(/setCircularAttachmentName\("خطاب اتحاد الغرف"\);/, 'setCircularAttachmentName("");');

// 2. Remove default display values from rendering
content = content.replace(/\{circularContactName \|\| "الأستاذ \/ محمد الصيعري"\}/g, '{circularContactName || "—"}');
content = content.replace(/\{circularIncomingFrom \|\| "اتحاد الغرف السعودية"\}/g, '{circularIncomingFrom || "—"}');
content = content.replace(/\{circularIncomingNumber \|\| "ACS005681"\}/g, '{circularIncomingNumber || "—"}');
content = content.replace(/\{circularIncomingDate \|\| "2025-10-12"\}/g, '{circularIncomingDate || "—"}');
content = content.replace(/\{circularSubject \|\| "دعوة المهتمين للانضمام إلى عضوية مجلس الأعمال السعودي التايلاندي"\}/g, '{circularSubject || "—"}');
content = content.replace(/\{circularContactPhone \|\| "0581517644"\}/g, '{circularContactPhone || "—"}');
content = content.replace(/\{circularContactEmail \|\| "malsaiari@fsc.org.sa"\}/g, '{circularContactEmail || "—"}');

// 3. Update the prompt to not use hardcoded examples that confuse the model
content = content.replace(
  /تاريخ خطاب الجهة: تاريخ الخطاب الأساسي للجهة المرسلة\\nرقم ملصق الغرفة: رقم الاستيكر\/الملصق المضاف من الغرفة \(مثل ACS005681\)\\nتاريخ ملصق الغرفة: تاريخ الاستيكر\/الملصق المضاف من الغرفة\\nالموضوع: موضوع التعميم الرئيسي بصياغة رسمية واضحة ومباشرة\\nمسؤول التواصل: اسم مسؤول التواصل ومسماه الوظيفي تماماً كما ورد في الخطاب \(مثال: أمين مجلس الأعمال الأستاذ\/ محمد الصيعري\)\\nهاتف التواصل: رقم الجوال إن وجد\\nبريد التواصل: البريد الإلكتروني إن وجد\\nاسم المرفق: اسم مقترح للمرفق بناءً على الجهة المرسلة \(مثل: خطاب اتحاد الغرف\)/g,
  `تاريخ خطاب الجهة: تاريخ الخطاب الأساسي للجهة المرسلة\\nرقم ملصق الغرفة: رقم الاستيكر/الملصق المضاف من الغرفة\\nتاريخ ملصق الغرفة: تاريخ الاستيكر/الملصق المضاف من الغرفة\\nالموضوع: موضوع التعميم الرئيسي بصياغة رسمية واضحة ومباشرة\\nمسؤول التواصل: اسم مسؤول التواصل ومسماه الوظيفي تماماً كما ورد في الخطاب (وإن لم يوجد اتركه فارغاً)\\nهاتف التواصل: رقم الجوال إن وجد (وإن لم يوجد اتركه فارغاً)\\nبريد التواصل: البريد الإلكتروني إن وجد (وإن لم يوجد اتركه فارغاً)\\nاسم المرفق: اسم مقترح للمرفق بناءً على الجهة المرسلة`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
