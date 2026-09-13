const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

code = code.replace(`const getDayName = (dateString: string) => {`, `const getArabicDayName = (dateString: string) => {`);
code = code.replace(`const getMonthName = (dateString: string) => {`, `const getArabicMonthName = (dateString: string) => {`);
code = code.replace(`day: getDayName(e.date),`, `day: getArabicDayName(e.date),`);
code = code.replace(`monthName: getMonthName(e.date),`, `monthName: getArabicMonthName(e.date),`);

fs.writeFileSync('src/pages/CommitteesHome.tsx', code);
console.log("Fixed names");
