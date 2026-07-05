const fs = require('fs');

const pages = [
  'src/pages/Tasks.tsx',
  'src/pages/CentersTasks.tsx',
  'src/pages/AffiliatesTasks.tsx',
  'src/pages/AssistantSecGenTasks.tsx',
  'src/pages/CommitteesTasks.tsx'
];

pages.forEach(page => {
  if (fs.existsSync(page)) {
    let content = fs.readFileSync(page, 'utf8');

    content = content.replace(/t\.attachments\.length/g, '(t.attachments || []).length');
    content = content.replace(/t\.attachments\.map/g, '(t.attachments || []).map');
    content = content.replace(/task\.attachments \|\| \[\]/g, 'task.attachments || []'); // Avoid double || [] if exists
    content = content.replace(/setTempAttachments\(task\.attachments\)/g, 'setTempAttachments(task.attachments || [])');
    
    fs.writeFileSync(page, content);
    console.log("Updated " + page);
  }
});
