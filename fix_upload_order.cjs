const fs = require('fs');

function fixUploadExtraction(file) {
    let content = fs.readFileSync(file, 'utf8');

    // For the second fetch block (قراءة وإدراج بنود)
    const parts = content.split("const response = await fetch('/api/gemini/extract-agenda', {");
    if (parts.length === 3) {
        // Look at parts[2] - it has the fetch call and Auto-archive below it.
        // But the first block (parts[1]) also does extraction! We need to patch BOTH.
        
        // Let's just use regex replacement or manual replacement to replace the whole try-catch for extraction.
        console.log("File has 2 endpoints.");
    }
}
fixUploadExtraction('src/pages/CommitteesEvents.tsx');
