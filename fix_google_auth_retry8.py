import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's completely remove the logic that tries to use someone else's token.
# If they are logged in, they use their own token.
# Wait, if Hussein is logged in, and creates an event for the Real Estate Committee.
# If we just remove the `employeeEmail` lookup, `createGoogleCalendarEvent` will just use `fetchGoogleAPI(..., undefined)`.
# `fetchGoogleAPI` will use `getSharedAccessToken()`, which will read `localStorage.getItem("google_access_token")`.
# That is Hussein's token!
# So Hussein will create the event on Hussein's calendar, and invite the attendees.
# BUT wait! If Hussein's token is EXPIRED, `fetchGoogleAPI` gets a 401.
# `fetchGoogleAPI` sees `customToken` is undefined.
# So it triggers `triggerAuthModal()`!
# Hussein sees a quick popup, it refreshes, and the event is created seamlessly!

# This is exactly what the user wants! "أبغى الموضوع يكون أسهل ومباشر بدون تكرار هذه الخطوة"
# The UI will automatically popup for the CURRENT USER and fix it seamlessly without logging out.

create_old = r'''export async function createGoogleCalendarEvent(event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
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

  return fetchGoogleAPI("calendar/v3/calendars/primary/events?sendUpdates=all", {'''

create_new = r'''export async function createGoogleCalendarEvent(event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI("calendar/v3/calendars/primary/events?sendUpdates=all", {'''

content = content.replace(create_old, create_new)


update_old = r'''export async function updateGoogleCalendarEvent(eventId: string, event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
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

  return fetchGoogleAPI(`calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {'''

update_new = r'''export async function updateGoogleCalendarEvent(eventId: string, event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {'''

content = content.replace(update_old, update_new)


delete_old = r'''export async function deleteGoogleCalendarEvent(eventId: string, employeeEmail?: string): Promise<any> {
  let tokenToUse: string | undefined = undefined;
  
  if (employeeEmail) {
    try {
      const tokenRef = doc(db, "employee_tokens", employeeEmail.toLowerCase());
      const snap = await getDoc(tokenRef);
      if (snap.exists() && snap.data().token) {
        tokenToUse = snap.data().token;
      } else {
        throw new Error("لم يقم هذا الموظف بتسجيل الدخول للسماح بإرسال الدعوات بعد.");
      }
    } catch (e) {
      throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");
    }
  }

  return fetchGoogleAPI(`calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {'''

delete_new = r'''export async function deleteGoogleCalendarEvent(eventId: string, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {'''

content = content.replace(delete_old, delete_new)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
