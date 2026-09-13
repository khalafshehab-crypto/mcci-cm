import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()


t1_old = r'''export async function updateGoogleTask(taskId: string, task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
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
      throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");
    }
  }

  return fetchGoogleAPI(`tasks/v1/lists/@default/tasks/${taskId}`, {'''

t1_new = r'''export async function updateGoogleTask(taskId: string, task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`tasks/v1/lists/@default/tasks/${taskId}`, {'''

content = content.replace(t1_old, t1_new)


t2_old = r'''export async function deleteGoogleTask(taskId: string, employeeEmail?: string): Promise<any> {
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
      throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");
    }
  }

  return fetchGoogleAPI(`tasks/v1/lists/@default/tasks/${taskId}`, {'''

t2_new = r'''export async function deleteGoogleTask(taskId: string, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`tasks/v1/lists/@default/tasks/${taskId}`, {'''
content = content.replace(t2_old, t2_new)


t3_old = r'''export async function createGoogleTask(task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
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
      throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");
    }
  }

  // First list or pick pre-existing task list, fallback to "@default"
  return fetchGoogleAPI("tasks/v1/lists/@default/tasks", {'''

t3_new = r'''export async function createGoogleTask(task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
  // First list or pick pre-existing task list, fallback to "@default"
  return fetchGoogleAPI("tasks/v1/lists/@default/tasks", {'''
content = content.replace(t3_old, t3_new)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
