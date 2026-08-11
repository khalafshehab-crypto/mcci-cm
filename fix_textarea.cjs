const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

const regex = /<textarea\s+value=\{aiGenGeneratedText\}\s+onChange=\{\(e\) => setAiGenGeneratedText\(e\.target\.value\)\}\s+className="flex-1 w-full h-full p-12 sm:p-16 text-\[16px\] leading-\[2\.2\] text-justify font-sans focus:outline-none resize-none bg-transparent placeholder-gray-300"\s+style=\{\{\s*whiteSpace:\s*'pre-wrap'\s*\}\}\s*\/>/;

const replacement = `<div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setAiGenGeneratedText(e.currentTarget.innerText)}
                          className="flex-1 w-full p-12 sm:p-16 text-[16px] leading-[2.2] text-justify font-sans focus:outline-none bg-transparent whitespace-pre-wrap outline-none"
                        >
                          {aiGenGeneratedText}
                        </div>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
    console.log("Patched textarea successfully!");
} else {
    console.log("Could not find the target textarea block.");
}
