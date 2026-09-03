const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const calendarFunc = `
export interface GoogleCalendarEventPayload {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}

export async function createGoogleCalendarEvent(event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
  let tokenToUse: string | undefined = undefined;
  if (employeeEmail) {
    try {
      const tokenRef = doc(db, "employee_tokens", employeeEmail.toLowerCase());
      const snap = await getDoc(tokenRef);
      if (snap.exists() && snap.data().token) {
        tokenToUse = snap.data().token;
      } else {
        throw new Error("لم يقم هذا الموظف بتسجيل الدخول للسماح باستقبال المواعيد بعد.");
      }
    } catch (e) {
      console.warn("Failed to fetch employee token", e);
      throw e;
    }
  }

  return fetchGoogleAPI("calendar/v3/calendars/primary/events", {
    method: "POST",
    body: JSON.stringify({
      summary: event.summary,
      description: event.description || "",
      start: event.start,
      end: event.end,
    }),
  }, 5, tokenToUse);
}
`;

code = code + '\n' + calendarFunc;
fs.writeFileSync('src/lib/googleApi.ts', code);
