const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const regex = /await createGoogleTask\(\{\s*title: \`\$\{title\} \(تكليف داخلي\)\`,\s*notes: \`الوصف: \$\{description\}\\nالمسند إليه: \$\{assignedTo\}\\nملاحظات: \$\{additionalNotes\}\`,\s*due: dueDate \? new Date\(dueDate\)\.toISOString\(\) : undefined\s*\}\);/;

const replacement = `const targetEmp = allEmployeesData.find(e => e.name === assignedTo);
        const empEmail = targetEmp ? targetEmp.email : undefined;

        await createGoogleTask({
          title: \`\${title} (تكليف داخلي)\`,
          notes: \`الوصف: \${description}\\nالمسند إليه: \${assignedTo}\\nملاحظات: \${additionalNotes}\`,
          due: dueDate ? new Date(dueDate).toISOString() : undefined
        }, empEmail);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
