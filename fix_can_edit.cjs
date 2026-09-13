const fs = require('fs');
let c = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

c = c.replace(
  /if \(user\.committees && Array\.isArray\(user\.committees\)\) \{\s*return user\.committees\.includes\(committeeName\) \|\| user\.committees\.includes\("عام"\) \|\| committeeName === "عام" \|\| committeeName === "الجميع";\s*\}/,
  `if (user.committees && Array.isArray(user.committees)) {
        if (user.committees.includes(committeeName) || user.committees.includes("عام") || committeeName === "عام" || committeeName === "الجميع") return true;
      }
      if (user.orgLevel1 === committeeName || user.orgLevel2 === committeeName || user.orgLevel3 === committeeName || user.orgLevel4 === committeeName || user.orgLevel5 === committeeName) {
        return true;
      }`
);

fs.writeFileSync('src/pages/CentersEvents.tsx', c);
