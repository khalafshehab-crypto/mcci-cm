const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf-8');

// Add getSharedAccessToken to imports
if (!content.includes('getSharedAccessToken')) {
    content = content.replace('subscribeToAccessToken,', 'getSharedAccessToken, subscribeToAccessToken,');
}

// Add inside useEffect
const newUseEffect = `
  useEffect(() => {
    getSharedAccessToken().then(() => {
       // Just pre-fetch it so the subscribe callback fires with the non-null value if exists
    });
    return subscribeToAccessToken((token) => {
`;

if (!content.includes('getSharedAccessToken().then')) {
    content = content.replace(
        /useEffect\(\(\) => \{\n\s+return subscribeToAccessToken\(\(token\) => \{/,
        newUseEffect
    );
}

fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', content);
console.log("Patched GoogleWorkspaceCenter");
