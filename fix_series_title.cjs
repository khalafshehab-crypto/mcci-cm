const fs = require('fs');
let code = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

const targetItemTitle = `          let itemTitle = \`\${prefixToMatch} \${numWord}\`.trim();
          if (seriesKind === "اجتماع" && seriesClassification === "دوري" && numWord === "الأول") {
            itemTitle += " (التأسيسي)";
          }
          results.push({`;

const replacementItemTitle = `          let itemTitle = \`\${prefixToMatch} \${numWord}\`.trim();
          if (seriesPartyName.trim()) {
             itemTitle += \` مع \${seriesPartyName.trim()}\`;
          }
          if (seriesKind === "اجتماع" && seriesClassification === "دوري" && numWord === "الأول") {
            itemTitle += " (التأسيسي)";
          }
          results.push({`;

code = code.replace(targetItemTitle, replacementItemTitle);

fs.writeFileSync('src/pages/CentersEvents.tsx', code);
