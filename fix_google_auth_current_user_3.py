import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_create = r'export async function createGoogleCalendarEvent'
idx_create = content.find(pattern_create)
if idx_create != -1:
    end_idx = content.find('return fetchGoogleAPI', idx_create)
    if end_idx != -1:
        new_create = r'''export async function createGoogleCalendarEvent(event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
  let tokenToUse: string | undefined = undefined;
  if (employeeEmail) {
    const isCurrentUser = auth.currentUser?.email?.toLowerCase() === employeeEmail.toLowerCase();
    if (!isCurrentUser) {
      try {
        const tokenRef = doc(db, "employee_tokens", employeeEmail.toLowerCase());
        const snap = await getDoc(tokenRef);
        if (snap.exists() && snap.data().token) {
          tokenToUse = snap.data().token;
        } else {
          throw new Error(`الموظف ${employeeEmail} لم يقم بربط حسابه بتقويم جوجل بعد.`);
        }
      } catch (e: any) {
        if (e.message && e.message.includes("الموظف")) throw e;
        throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");
      }
    }
  }

  '''
        content = content[:idx_create] + new_create + content[end_idx:]


pattern_update = r'export async function updateGoogleCalendarEvent'
idx_update = content.find(pattern_update)
if idx_update != -1:
    end_idx = content.find('return fetchGoogleAPI', idx_update)
    if end_idx != -1:
        new_update = r'''export async function updateGoogleCalendarEvent(eventId: string, event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
  let tokenToUse: string | undefined = undefined;
  if (employeeEmail) {
    const isCurrentUser = auth.currentUser?.email?.toLowerCase() === employeeEmail.toLowerCase();
    if (!isCurrentUser) {
      try {
        const tokenRef = doc(db, "employee_tokens", employeeEmail.toLowerCase());
        const snap = await getDoc(tokenRef);
        if (snap.exists() && snap.data().token) {
          tokenToUse = snap.data().token;
        } else {
          throw new Error(`الموظف ${employeeEmail} لم يقم بربط حسابه بتقويم جوجل بعد.`);
        }
      } catch (e: any) {
        if (e.message && e.message.includes("الموظف")) throw e;
        throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");
      }
    }
  }

  '''
        content = content[:idx_update] + new_update + content[end_idx:]


with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
