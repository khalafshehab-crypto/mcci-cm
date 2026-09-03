const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

// 1. Modify fetchGoogleAPI to accept customToken
code = code.replace(/async function fetchGoogleAPI\(endpoint: string, options: RequestInit = \{\}, maxRetries = 5\): Promise<any> \{/, 
  "async function fetchGoogleAPI(endpoint: string, options: RequestInit = {}, maxRetries = 5, customToken?: string): Promise<any> {");

code = code.replace(/const token = await getSharedAccessToken\(\);/, 
  "const token = customToken || await getSharedAccessToken();");

// 2. Modify createGoogleTask to accept employeeEmail and fetch their token
const createGTaskOld = `export async function createGoogleTask(task: GoogleTaskPayload): Promise<any> {
  // First list or pick pre-existing task list, fallback to "@default"
  return fetchGoogleAPI("tasks/v1/lists/@default/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || "",
      due: task.due || undefined,
    }),
  });
}`;

const createGTaskNew = `import { doc, getDoc } from 'firebase/firestore';

export async function createGoogleTask(task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
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

  // First list or pick pre-existing task list, fallback to "@default"
  return fetchGoogleAPI("tasks/v1/lists/@default/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || "",
      due: task.due || undefined,
    }),
  }, 5, tokenToUse);
}`;

if (!code.includes("export async function createGoogleTask(task: GoogleTaskPayload, employeeEmail?: string)")) {
  code = code.replace(createGTaskOld, createGTaskNew);
  if (!code.includes("import { doc, getDoc }")) {
      // It might have import { doc } from 'firebase/firestore' or from '../lib/firebase'
      // Wait, firebase is already imported? Let's check the top of the file
  }
}

fs.writeFileSync('src/lib/googleApi.ts', code);
