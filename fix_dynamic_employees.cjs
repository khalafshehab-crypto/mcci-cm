const fs = require('fs');

function updateFile(file, regexStr, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /((?:e\.orgLevel1 && e\.orgLevel1\.match\(\/.*?\/\)) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(\/.*?\/\)) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(\/.*?\/\)\)\)/g,
    replacement
  );
  // Also try to replace assistant sec gen, which has a slightly different pattern
  content = content.replace(
    /\(\(e\.orgLevel1 && e\.orgLevel1\.match\(\/مساعد الأمين\/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(\/مساعد الأمين\/\)\) \|\| \(e\.title && e\.title\.match\(\/سكرتير\/\)\)\)/g,
    `(["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel1) || ["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel2) || ["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel3) || (e.title && e.title.includes("سكرتير")))`
  );
  fs.writeFileSync(file, content);
}

// 1. Centers
let cEvents = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');
cEvents = cEvents.replace(
  /\(\(e\.orgLevel1 && e\.orgLevel1\.match\(\/المراكز\/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(\/المراكز\/\)\) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(\/المراكز\/\)\)\)/g,
  `(e.orgLevel1 === "المراكز" || e.orgLevel2 === "المراكز" || e.orgLevel3 === "المراكز" || e.orgLevel4 === "المراكز" || e.orgLevel1 === "إدارة المراكز" || e.orgLevel2 === "إدارة المراكز" || e.orgLevel3 === "إدارة المراكز" || e.orgLevel4 === "إدارة المراكز")`
);
fs.writeFileSync('src/pages/CentersEvents.tsx', cEvents);

// 2. Committees
let commEvents = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');
commEvents = commEvents.replace(
  /\(\(e\.orgLevel1 && e\.orgLevel1\.match\(\/اللجان\/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(\/اللجان\/\)\) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(\/اللجان\/\)\)\)/g,
  `(e.orgLevel1 === "اللجان" || e.orgLevel2 === "اللجان" || e.orgLevel3 === "اللجان" || e.orgLevel4 === "اللجان" || e.orgLevel1 === "إدارة اللجان" || e.orgLevel2 === "إدارة اللجان" || e.orgLevel3 === "إدارة اللجان" || e.orgLevel4 === "إدارة اللجان")`
);
fs.writeFileSync('src/pages/CommitteesEvents.tsx', commEvents);

// 3. Affiliates
let affEvents = fs.readFileSync('src/pages/AffiliatesEvents.tsx', 'utf8');
affEvents = affEvents.replace(
  /\(\(e\.orgLevel1 && e\.orgLevel1\.match\(\/المنتسبين\/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(\/المنتسبين\/\)\) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(\/المنتسبين\/\)\)\)/g,
  `(e.orgLevel1 === "المنتسبين" || e.orgLevel2 === "المنتسبين" || e.orgLevel3 === "المنتسبين" || e.orgLevel4 === "المنتسبين" || e.orgLevel1 === "إدارة المنتسبين" || e.orgLevel2 === "إدارة المنتسبين" || e.orgLevel3 === "إدارة المنتسبين" || e.orgLevel4 === "إدارة المنتسبين")`
);
fs.writeFileSync('src/pages/AffiliatesEvents.tsx', affEvents);

// 4. AssistantSecGenEvents
let asstEvents = fs.readFileSync('src/pages/AssistantSecGenEvents.tsx', 'utf8');
asstEvents = asstEvents.replace(
  /\(\(e\.orgLevel1 && e\.orgLevel1\.match\(\/مساعد الأمين\/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(\/مساعد الأمين\/\)\) \|\| \(e\.title && e\.title\.match\(\/سكرتير\/\)\)\)/g,
  `(["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel1) || ["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel2) || ["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel3) || (e.title && e.title.includes("سكرتير")))`
);
fs.writeFileSync('src/pages/AssistantSecGenEvents.tsx', asstEvents);

