const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

code = code.replace(/vicePresident/, '"vicePresident"');
code = code.replace(/export interface Committee \{[\s\S]*?ratingIssues\?: string;\n\}/,
`export interface Committee {
  id: number | string;
  name: string;
  description?: string;
  membersCount: number;
  meetingsCount: number;
  recommendationsCount: number;
  eventsCount: number;
  president?: string;
  specialist?: string;
  status?: "فعالة" | "غير فعالة" | string;
  active?: boolean;
  libraryLink?: string;
  objectives?: string;
  attachments?: any[];
  strategicPlan?: string;
  desc?: string;
  formationLetter?: string;
  ratingIssues?: string;
}`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
