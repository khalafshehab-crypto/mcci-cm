const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

const oldUI = `                    <div className="flex-1 bg-gray-100 p-2 sm:p-6 rounded-xl overflow-y-auto flex justify-center min-h-[60vh]">
                      <div className="bg-white shadow-lg border border-gray-200 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mb-4 mx-auto">
                        <textarea
                          value={aiGenGeneratedText}
                          onChange={(e) => setAiGenGeneratedText(e.target.value)}
                          className="flex-1 w-full h-full p-8 sm:p-12 text-[15px] leading-loose text-justify font-sans focus:outline-none resize-none bg-transparent"
                        />
                      </div>
                    </div>`;

const newUI = `                    <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                      <div className="bg-white shadow-xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all">
                        <textarea
                          value={aiGenGeneratedText}
                          onChange={(e) => setAiGenGeneratedText(e.target.value)}
                          className="flex-1 w-full h-full p-12 sm:p-16 text-[16px] leading-[2.2] text-justify font-sans focus:outline-none resize-none bg-transparent placeholder-gray-300"
                          style={{ whiteSpace: 'pre-wrap' }}
                        />
                      </div>
                    </div>`;

if (content.includes(oldUI)) {
    content = content.replace(oldUI, newUI);
    fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
    console.log("Patched UI successfully again!");
} else {
    console.log("Could not find UI block.");
}
