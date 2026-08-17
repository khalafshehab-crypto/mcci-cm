const fs = require('fs');

let c = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');
const searchC = c.substring(c.indexOf('const textBody = evt.preparationsText || "";'), c.indexOf('window.location.href = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;') + 'window.location.href = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;'.length);

const replaceC = `const mailSubject = evt.title || "توصية قطاعية";
                                                          const mailBody = evt.preparationsText || "";
                                                          const a = document.createElement('a');
                                                          a.href = \`https://mail.google.com/mail/?view=cm&fs=1&su=\${encodeURIComponent(mailSubject)}&body=\${encodeURIComponent(mailBody)}\`;
                                                          a.target = '_blank';
                                                          a.rel = 'noopener noreferrer';
                                                          a.click();`;

if (c.includes(searchC)) {
    fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', c.replace(searchC, replaceC));
    console.log("Patched CommitteesRecommendations.tsx");
} else {
    console.log("Could not find block in CommitteesRecommendations");
}

let r = fs.readFileSync('src/pages/Recommendations.tsx', 'utf-8');
const searchR = `window.location.href = \`mailto:?subject=\${encodeURIComponent("تفعيل توصية قطاعية دائرية")}&body=\${encodeURIComponent(evt.preparationsText || "")}\`;`;
const replaceR = replaceC;

if (r.includes(searchR)) {
    fs.writeFileSync('src/pages/Recommendations.tsx', r.replace(searchR, replaceR));
    console.log("Patched Recommendations.tsx");
} else {
    console.log("Could not find block in Recommendations");
}
