const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  const target = `const response = await fetch("/api/gemini/reply-to-letter", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      incomingLetter: text,
                                      fileBase64: fileObj?.base64,
                                      mimeType: fileObj?.mimeType
                                    })
                                  });
                                  const data = await response.json();
                                  if (response.ok) {
                                    setSlContent(data.result);
                                    if (!slTitle) setSlTitle("رد على خطاب وارد");
                                  } else {
                                    alert("خطأ: " + (data.error?.message || data.error));
                                  }
                                } catch (e) {
                                  alert("حدث خطأ أثناء التوليد");
                                }`;

  const replace = `const response = await fetch("/api/gemini/reply-to-letter", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      incomingLetter: text,
                                      fileBase64: fileObj?.base64,
                                      mimeType: fileObj?.mimeType
                                    })
                                  });
                                  
                                  const contentType = response.headers.get("content-type");
                                  if (contentType && contentType.includes("application/json")) {
                                    const data = await response.json();
                                    if (response.ok) {
                                      setSlContent(data.result);
                                      if (!slTitle) setSlTitle("رد على خطاب وارد");
                                    } else {
                                      alert("خطأ من الخادم: " + (data.error?.message || data.error || JSON.stringify(data)));
                                    }
                                  } else {
                                    const textRes = await response.text();
                                    throw new Error(\`الخادم لا يستجيب بشكل صحيح (تأكد من إعدادات Vercel أو الخادم). الحالة: \${response.status}\`);
                                  }
                                } catch (e: any) {
                                  console.error("Generate Reply Catch:", e);
                                  alert("حدث خطأ أثناء التوليد: " + (e.message || e));
                                }`;

  if (code.includes('const response = await fetch("/api/gemini/reply-to-letter"')) {
    code = code.replace(target, replace);
    fs.writeFileSync(filepath, code);
    console.log("Patched " + filepath);
  } else {
    console.log("Target not found in " + filepath);
  }
}

patchFile('src/pages/CommitteesLibrary.tsx');
patchFile('src/pages/Library.tsx');
