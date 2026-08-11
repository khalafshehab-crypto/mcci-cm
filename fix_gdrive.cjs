const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

// Add state
const stateHook = `const [guides, setGuides] = useState<File | string | null>(null);`;
if (!content.includes(`const [googleDriveUrl, setGoogleDriveUrl] = useState("")`)) {
    content = content.replace(stateHook, `${stateHook}\n  const [googleDriveUrl, setGoogleDriveUrl] = useState("");`);
}

// Add to resetForm
const resetForm = `setGuides(null);`;
if (!content.includes(`setGoogleDriveUrl("");`)) {
    content = content.replace(resetForm, `${resetForm}\n    setGoogleDriveUrl("");`);
}

// Add to handleOpenEdit
const handleOpenEdit = `setGuides(comm.guides || null);`;
if (!content.includes(`setGoogleDriveUrl(comm.libraryLink || "");`)) {
    content = content.replace(handleOpenEdit, `${handleOpenEdit}\n    setGoogleDriveUrl(comm.libraryLink || "");`);
}

// Add to handleSave mapping
const saveObj = `guides: typeof guides === 'string' ? guides : (guides ? URL.createObjectURL(guides as Blob) : ""),`;
if (!content.includes(`libraryLink: googleDriveUrl,`)) {
    content = content.replace(saveObj, `${saveObj}\n          libraryLink: googleDriveUrl,`);
}

fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched CommitteesFormation for googleDriveUrl");
