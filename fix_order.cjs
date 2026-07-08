const fs = require('fs');

['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');

  // Swap the two divs
  const regex = /(<div className="flex items-center gap-2 text-brand">\s*<List className="w-3\.5 h-3\.5" \/>\s*<span>الاجتماع: \{evt\.eventName \|\| "توصية مباشرة"\}<\/span>\s*<\/div>)\s*(<div className="flex items-center gap-2">\s*<Activity className="w-3\.5 h-3\.5 text-gray-500" \/>\s*<span>اللجنة: \{evt\.committeeName\}<\/span>\s*<\/div>)/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, '$2\n                              $1');
    console.log('Swapped in ' + filepath);
  } else {
    console.log('Regex did not match in ' + filepath);
  }

  fs.writeFileSync(filepath, content, 'utf8');
});
