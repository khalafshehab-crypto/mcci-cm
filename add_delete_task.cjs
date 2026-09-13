const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const newCode = `export async function deleteGoogleTask(taskId: string, employeeEmail?: string): Promise<any> {
  let tokenToUse: string | undefined = undefined;
  
  if (employeeEmail) {
    try {
      const tokenRef = doc(db, "employee_tokens", employeeEmail.toLowerCase());
      const snap = await getDoc(tokenRef);
      if (snap.exists() && snap.data().token) {
        tokenToUse = snap.data().token;
      } else {
        throw new Error("لم يقم هذا الموظف بتسجيل الدخول للسماح باستقبال المهام بعد.");
      }
    } catch (e) {
      console.warn("Failed to fetch employee token", e);
      throw e;
    }
  }

  return fetchGoogleAPI(\`tasks/v1/lists/@default/tasks/\${taskId}\`, {
    method: "DELETE",
  }, 5, tokenToUse);
}

export async function createGoogleTask`;

code = code.replace(`export async function createGoogleTask`, newCode);
fs.writeFileSync('src/lib/googleApi.ts', code);
console.log("Added deleteGoogleTask");
