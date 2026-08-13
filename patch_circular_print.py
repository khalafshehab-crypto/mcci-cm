with open('src/pages/CommitteesFormation.tsx', 'r') as f:
    content = f.read()

old_print = '''                                <head>
                                  <title>${circ.title}</title>
                                  <style>
                                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                                    body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.8; }
                                    .content { white-space: pre-wrap; font-size: 16px; }
                                    @media print {
                                      body { padding: 0; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="content">${circ.templateText}</div>
                                  <script>window.print();</script>
                                </body>'''

new_print = '''                                <head>
                                  <title>${circ.title}</title>
                                  <style>
                                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                                    body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; color: #111; line-height: 2.2; max-width: 800px; margin: 0 auto; font-size: 16px; text-align: justify; }
                                    .content { white-space: pre-wrap; }
                                    @media print {
                                      body { padding: 0; }
                                      @page { margin: 2.5cm; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="content">${circ.templateText}</div>
                                  <script>
                                    window.onload = () => { window.print(); }
                                  </script>
                                </body>'''

content = content.replace(old_print, new_print)
with open('src/pages/CommitteesFormation.tsx', 'w') as f:
    f.write(content)
