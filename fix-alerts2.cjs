const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // In useEffects, replace: 
    // if (commName && !canUserEditCommittee(commName)) { alert("..."); return; }
    // with:
    // if (commName && !canUserEditCommittee(commName)) return;

    // Specifically for auto-calculating effects
    content = content.replace(
        /if \(commName && !canUserEditCommittee\(commName\)\) \{ alert\("غير مصرح لك بجدولة فعاليات لهذه اللجنة"\); return; \}/g,
        (match, offset, str) => {
            // If it's inside a handler, keep it. How to know?
            // Actually, in generating the title (useEffect), it's preceded by:
            // const commName = committees.find(...)
            // Let's just remove the alert everywhere where we just want it to be silent.
            // Wait, we WANT the alert if the user clicks "Save"!
            return match;
        }
    );
    
    // Instead of regex, let's just do precise replacement for the lines inside useEffect.
    // In CommitteesEvents.tsx, lines 504 and 517 roughly.
    
    fs.writeFileSync(file, content);
}

// Let's just do it manually with sed or a careful JS script
