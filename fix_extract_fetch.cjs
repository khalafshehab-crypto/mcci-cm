const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the entire fetch block up to JSON.parse(jsonMatch[0])
  const regex1 = /const response = await fetch\('\/api\/gemini\/extract-agenda'[\s\S]*?const aiText = responseData\.result \|\| "";/g;
  
  content = content.replace(regex1, `const response = await fetch('/api/gemini/extract-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, fileBase64, mimeType })
        });
        
        if (!response.ok) {
            let errMsg = "خطأ مجهول";
            try {
                const textErr = await response.text();
                if (textErr) {
                    try {
                        const errObj = JSON.parse(textErr);
                        errMsg = errObj.details || errObj.error || "خطأ مجهول";
                        if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                            errMsg = "عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية من الذكاء الاصطناعي (Quota Exceeded). يرجى المحاولة لاحقاً.";
                        }
                    } catch(e) {
                        errMsg = "تعذر الاتصال بالخادم، قد يكون حجم الملف كبيراً جداً (حاول رفع ملف أقل من 1 ميجا) أو حدث خطأ في الشبكة";
                    }
                }
            } catch(e) {}
            throw new Error(errMsg);
        }
        
        const responseData = await response.json();
        const aiText = responseData.result || "";`);
        
  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
}

fixFile('src/pages/CommitteesEvents.tsx');
fixFile('src/pages/Events.tsx');
