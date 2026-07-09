import fs from 'fs';
const text = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');
console.log(text.includes('agendaRecs'));
