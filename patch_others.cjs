const fs = require('fs');

function replaceFile(path) {
  let content = fs.readFileSync(path, 'utf-8');
  content = content.replace('getCachedAccessToken,', 'getCachedAccessToken, getSharedAccessToken,');
  content = content.replace(/const token = getCachedAccessToken\(\);/g, 'const token = await getSharedAccessToken();');
  content = content.replace(/if \(getCachedAccessToken\(\)\) \{/g, 'if (await getSharedAccessToken()) {');
  fs.writeFileSync(path, content);
}

replaceFile('src/pages/CommitteesRecommendations.tsx');
replaceFile('src/pages/CommitteesFormation.tsx');
replaceFile('src/pages/Committees.tsx');

console.log("Patched others");
