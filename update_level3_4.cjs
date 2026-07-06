const fs = require('fs');

function patch(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Change Level 3 condition
    content = content.replace(
        /selectedClassificationForCards === null \? \(/g,
        'selectedClassificationForCards === null && selectedEventKindForCards === "اجتماع" ? ('
    );

    // 2. Change Level 4 title logic
    const oldTitleHtml = `                    قائمة الفعاليات الـ (<span className="text-emerald-600">{selectedClassificationForCards}</span>) من نوع (
                    <span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (
                    <span className="text-brand">
                      {rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}
                    </span>
                    )`;
                    
    const newTitleHtml = `                    {selectedEventKindForCards === "اجتماع" ? (
                      <>
                        قائمة الفعاليات الـ (<span className="text-emerald-600">{selectedClassificationForCards}</span>) من نوع (
                        <span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (
                        <span className="text-brand">
                          {rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}
                        </span>
                        )
                      </>
                    ) : (
                      <>
                        قائمة فعاليات نوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (
                        <span className="text-brand">
                          {rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}
                        </span>
                        )
                      </>
                    )}`;
    
    content = content.replace(oldTitleHtml, newTitleHtml);

    // 3. Change Level 4 back button logic
    const oldButtonHtml = `                <button
                  onClick={() => setSelectedClassificationForCards(null)}
                  className="text-xs text-brand font-black hover:underline"
                >
                  الرجوع خطوة للأعلى (الفرز والتصنيفات) ↑
                </button>`;

    const newButtonHtml = `                <button
                  onClick={() => {
                    if (selectedEventKindForCards !== "اجتماع") {
                      setSelectedEventKindForCards(null);
                    } else {
                      setSelectedClassificationForCards(null);
                    }
                  }}
                  className="text-xs text-brand font-black hover:underline"
                >
                  {selectedEventKindForCards !== "اجتماع" ? "الرجوع خطوة للأعلى (عناوين أنواع الفعاليات) ↑" : "الرجوع خطوة للأعلى (الفرز والتصنيفات) ↑"}
                </button>`;

    content = content.replace(oldButtonHtml, newButtonHtml);

    // 4. Change Level 4 filtering logic
    const oldFilterHtml = `                    e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    getEventClassification(e.title) === selectedClassificationForCards`;
                    
    const newFilterHtml = `                    e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    (selectedEventKindForCards !== "اجتماع" || getEventClassification(e.title) === selectedClassificationForCards)`;

    content = content.replace(oldFilterHtml, newFilterHtml);

    fs.writeFileSync(filePath, content);
    console.log("Updated", filePath);
}

patch('src/pages/CommitteesEvents.tsx');
patch('src/pages/Events.tsx');
