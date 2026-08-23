const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(
  `                  {aiGenStep > 1 && !isAIGenGenerating && (
                    <button
                      onClick={() => setAiGenStep(aiGenStep - 1)}
                      className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" /> رجوع
                    </button>
                  )}
                </div>
                
                {aiGenStep === 3 && workspaceService === "circular" && (`,
  `                  {aiGenStep > 1 && !isAIGenGenerating && (
                    <button
                      onClick={() => setAiGenStep(aiGenStep - 1)}
                      className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" /> رجوع
                    </button>
                  )}
                </div>

                {aiGenStep === 2 && !isAIGenGenerating && (
                  <button
                    onClick={() => setAiGenStep(3)}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-[#133E87] rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    التالي (تعبئة يدوية) <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                
                {aiGenStep === 3 && workspaceService === "circular" && (`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
