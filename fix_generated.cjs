const fs = require('fs');

['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');

  // We want to replace the definition of generatedProposal.
  const regex = /const generatedProposal = isPassing[\s\S]*?المرفقات: \$\{attachmentsText\}\`;/m;
  const newCode = 'const generatedProposal = evt.description || evt.recommendationText || evt.notes || "لا يوجد نص للتوصية";';
  
  if (regex.test(content)) {
    content = content.replace(regex, newCode);
    console.log('Replaced in ' + filepath);
  } else {
    console.log('Regex did not match in ' + filepath);
  }

  fs.writeFileSync(filepath, content, 'utf8');
});
