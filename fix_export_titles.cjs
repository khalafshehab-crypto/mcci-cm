const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

const getArabicOrdinal = `
const getArabicOrdinal = (num) => {
  const ordinals = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
  return ordinals[num] || num.toString();
};
`;

if (!content.includes('getArabicOrdinal')) {
  content = content.replace('const DAYSMaps', getArabicOrdinal + '\nconst DAYSMaps');
}

content = content.replace(
  /title: \`توصية البند: \$\{index \+ 1\} - \$\{rec\.title\}\`,/g,
  'title: `توصية البند ${getArabicOrdinal(index)} "${rec.title}"`,'
);

// We need to also map `recommendationText` so the generator picks it up.
content = content.replace(
  /description: rec\.recommendation \|\| "",/g,
  'description: rec.recommendation || "",\n        recommendationText: rec.recommendation || "",\n        recommendationDiscussion: rec.discussion || "",'
);

fs.writeFileSync('src/pages/CommitteesEvents.tsx', content, 'utf8');
console.log('Fixed export titles in CommitteesEvents');
