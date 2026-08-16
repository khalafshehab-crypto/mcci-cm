const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // We want to replace the `if (!response.ok)` block.
    // There are 2 in CommitteesEvents.tsx, 2 in Events.tsx.
    
    const blockRegex = /if \(\!response\.ok\) \{\s*let errMsg = "خطأ مجهول";\s*try \{\s*const textErr = await response\.text\(\);\s*if \(textErr\) \{\s*try \{\s*const errObj = JSON\.parse\(textErr\);\s*errMsg = errObj\.details \|\| errObj\.error \|\| "خطأ مجهول";\s*if \(errMsg\.includes\("429"\) \|\| errMsg\.includes\("Quota"\) \|\| errMsg\.includes\("exceeded"\)\) \{\s*errMsg = "عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية من الذكاء الاصطناعي \(Quota Exceeded\)\. يرجى المحاولة لاحقاً\.";\s*\}\s*\} catch\(e\) \{\s*errMsg = "تعذر الاتصال بالخادم، قد يكون حجم الملف كبيراً جداً \(حاول رفع ملف أقل من 1 ميجا\) أو حدث خطأ في الشبكة";\s*\}\s*\}\s*\} catch\(e\) \{\}\s*throw new Error\(errMsg\);\s*\}/g;

    const newBlock = `if (!response.ok) {
            let errMsg = \`خطأ مجهول (كود: \${response.status})\`;
            try {
                const textErr = await response.text();
                if (textErr) {
                    try {
                        const errObj = JSON.parse(textErr);
                        errMsg = errObj.details || errObj.error || errMsg;
                        if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
                        if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                            errMsg = "عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية من الذكاء الاصطناعي (Quota Exceeded). يرجى المحاولة لاحقاً.";
                        }
                    } catch(e) {
                        errMsg = \`تعذر الاتصال بالخادم أو حجم الملف كبير جداً (كود: \${response.status})\`;
                    }
                } else {
                    errMsg = \`استجابة فارغة من الخادم (كود: \${response.status})\`;
                }
            } catch(e) {
                errMsg = \`انقطع الاتصال أثناء القراءة (كود: \${response.status})\`;
            }
            throw new Error(errMsg);
        }`;

    content = content.replace(blockRegex, newBlock);

    fs.writeFileSync(file, content);
    console.log("Fixed errors in " + file);
}

fixFile('src/pages/CommitteesEvents.tsx');
fixFile('src/pages/Events.tsx');
