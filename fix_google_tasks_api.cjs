const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

if (!code.includes('updateGoogleTask')) {
    const updateFunc = `
export async function updateGoogleTask(taskId: string, task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
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
    method: "PUT",
    body: JSON.stringify({
      id: taskId,
      title: task.title,
      notes: task.notes || "",
      due: task.due || undefined,
    }),
  }, 5, tokenToUse);
}
`;
    code = code.replace('export async function createGoogleTask', updateFunc + '\nexport async function createGoogleTask');
    fs.writeFileSync('src/lib/googleApi.ts', code);
    console.log("Added updateGoogleTask");
}
