const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const oldDeleteFn = `    try {
      const savedLogs = localStorage.getItem("app_system_logs");
      let currentLogs = [];
      if (savedLogs) {
        try {
          currentLogs = JSON.parse(savedLogs);
        } catch (ex) {}
      }
      const timestamp = new Date().toISOString().substring(0, 19).replace('T', ' ');
      const deletedItem = tasks.find(t => t.id === taskToDeleteId);
      const deletedTitle = deletedItem ? deletedItem.title : "مهمة إدارية منوعة";
      const logEntry = {
        id: Date.now(),
        employeeName: currentUserName,
        time: timestamp,
        operationType: "حذف مهمة",
        status: "ناجحة",
        details: \`تم حذف مهمة عمل [\${deletedTitle}]. سبب الحذف والمبرر الإداري: \${deleteReason.trim()}\`
      };
      localStorage.setItem("app_system_logs", JSON.stringify([logEntry, ...currentLogs]));
      
      await deleteDoc(doc(db, "tasks", taskToDeleteId));
    } catch (err) {`;

const newDeleteFn = `    try {
      const savedLogs = localStorage.getItem("app_system_logs");
      let currentLogs = [];
      if (savedLogs) {
        try {
          currentLogs = JSON.parse(savedLogs);
        } catch (ex) {}
      }
      const timestamp = new Date().toISOString().substring(0, 19).replace('T', ' ');
      const deletedItem = tasks.find(t => t.id === taskToDeleteId);
      const deletedTitle = deletedItem ? deletedItem.title : "مهمة إدارية منوعة";
      const logEntry = {
        id: Date.now(),
        employeeName: currentUserName,
        time: timestamp,
        operationType: "حذف مهمة",
        status: "ناجحة",
        details: \`تم حذف مهمة عمل [\${deletedTitle}]. سبب الحذف والمبرر الإداري: \${deleteReason.trim()}\`
      };
      localStorage.setItem("app_system_logs", JSON.stringify([logEntry, ...currentLogs]));
      
      if (deletedItem && deletedItem.googleTaskIds) {
          const keys = Object.keys(deletedItem.googleTaskIds);
          for (const key of keys) {
              const emp = allEmployeesData.find(e => e.name === key);
              if (emp && emp.email) {
                  try {
                      await deleteGoogleTask(deletedItem.googleTaskIds[key], emp.email);
                  } catch(e) {
                      console.warn("Failed to delete task from Google Tasks", e);
                  }
              }
          }
      }

      await deleteDoc(doc(db, "tasks", taskToDeleteId));
    } catch (err) {`;

if(code.includes(oldDeleteFn)) {
    code = code.replace(oldDeleteFn, newDeleteFn);
    fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
    console.log("Fixed delete in CommitteesTasks");
} else {
    console.log("Could not find delete in CommitteesTasks");
}
