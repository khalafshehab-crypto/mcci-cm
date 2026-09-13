const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const oldDeleteFn = `      localStorage.setItem("app_system_logs", JSON.stringify([logEntry, ...currentLogs]));
      
      await deleteDoc(doc(db, "tasks", taskToDeleteId));`;

const newDeleteFn = `      localStorage.setItem("app_system_logs", JSON.stringify([logEntry, ...currentLogs]));
      
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

      await deleteDoc(doc(db, "tasks", taskToDeleteId));`;

if(code.includes(oldDeleteFn)) {
    code = code.replace(oldDeleteFn, newDeleteFn);
    fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
    console.log("Fixed delete in CommitteesTasks");
} else {
    console.log("Could not find delete in CommitteesTasks");
}
