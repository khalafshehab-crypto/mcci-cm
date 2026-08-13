import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_print = '''                          printWin.document.write(`
                            <html dir="rtl">
                              <head>
                                <title>طباعة الخطاب</title>
                                <style>
                                  body { font-family: 'Cairo', system-ui, sans-serif; padding: 40px; color: #000; line-height: 2.2; max-width: 800px; margin: 0 auto; font-size: 16px; }
                                  .content { white-space: pre-wrap; text-align: justify; }
                                  @media print {
                                    body { padding: 0; }
                                    @page { margin: 2.5cm; }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="content">${aiGenGeneratedText}</div>
                                <script>
                                  window.onload = () => { window.print(); window.close(); }
                                </script>
                              </body>
                            </html>
                          `);'''

new_print = '''                          if (workspaceService === "circular") {
                            const circularBody = aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText;
                            printWin.document.write(`
                              <html dir="rtl">
                                <head>
                                  <title>طباعة التعميم</title>
                                  <style>
                                    body { font-family: 'Cairo', system-ui, sans-serif; padding: 40px; color: #000; line-height: 2.2; max-width: 800px; margin: 0 auto; font-size: 16px; }
                                    .content { white-space: pre-wrap; text-align: justify; }
                                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                                    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 30px; }
                                    @media print {
                                      body { padding: 0; }
                                      @page { margin: 2.5cm; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">تعميم داخلي</h1>
                                    <h2 style="font-size: 18px; font-weight: bold; margin: 0;">${commName}</h2>
                                  </div>
                                  <div class="meta">
                                    <div><strong>إلى:</strong> جميع أعضاء اللجان الموقرين</div>
                                    <div><strong>من:</strong> إدارة اللجان</div>
                                    <div><strong>وارد من:</strong> ${circularIncomingFrom || "—"}</div>
                                    <div><strong>التاريخ والرقم:</strong> ${circularNumberDate || "—"}</div>
                                    <div style="grid-column: 1 / -1;"><strong>الموضوع:</strong> ${circularSubject || "—"}</div>
                                  </div>
                                  <div class="content">${circularBody}</div>
                                  <div style="margin-top: 50px; text-align: center; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 30px;">
                                    شاكرين ومقدرين تعاونكم،،،
                                  </div>
                                  <script>
                                    window.onload = () => { window.print(); window.close(); }
                                  </script>
                                </body>
                              </html>
                            `);
                          } else {
                            printWin.document.write(`
                              <html dir="rtl">
                                <head>
                                  <title>طباعة الخطاب</title>
                                  <style>
                                    body { font-family: 'Cairo', system-ui, sans-serif; padding: 40px; color: #000; line-height: 2.2; max-width: 800px; margin: 0 auto; font-size: 16px; }
                                    .content { white-space: pre-wrap; text-align: justify; }
                                    @media print {
                                      body { padding: 0; }
                                      @page { margin: 2.5cm; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="content">${aiGenGeneratedText}</div>
                                  <script>
                                    window.onload = () => { window.print(); window.close(); }
                                  </script>
                                </body>
                              </html>
                            `);
                          }'''

content = content.replace(old_print, new_print)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
