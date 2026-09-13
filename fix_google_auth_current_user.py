import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

create_regex = r'export async function createGoogleCalendarEvent\(event: GoogleCalendarEventPayload, employeeEmail\?: string\): Promise<any> \{\n\s+let tokenToUse: string \| undefined = undefined;\n\s+if \(employeeEmail\) \{\n\s+try \{\n\s+const tokenRef = doc\(db, "employee_tokens", employeeEmail\.toLowerCase\(\)\);\n\s+const snap = await getDoc\(tokenRef\);\n\s+if \(snap\.exists\(\) && snap\.data\(\)\.token\) \{\n\s+tokenToUse = snap\.data\(\)\.token;\n\s+\} else \{\n\s+throw new Error\(`الموظف \$\{employeeEmail\} لم يقم بربط حسابه بتقويم جوجل بعد\.`\);\n\s+\}\n\s+\} catch \(e\) \{\n\s+throw new Error\("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود\."\);\n\s+\}\n\s+\}'

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
  }'''

content = content.replace(create_regex, new_create)
if new_create not in content:
    # Use regular expression approach if exact match fails
    import sys
    print("Failed exact match for create", file=sys.stderr)


update_regex = r'export async function updateGoogleCalendarEvent\(eventId: string, event: GoogleCalendarEventPayload, employeeEmail\?: string\): Promise<any> \{\n\s+let tokenToUse: string \| undefined = undefined;\n\s+if \(employeeEmail\) \{\n\s+try \{\n\s+const tokenRef = doc\(db, "employee_tokens", employeeEmail\.toLowerCase\(\)\);\n\s+const snap = await getDoc\(tokenRef\);\n\s+if \(snap\.exists\(\) && snap\.data\(\)\.token\) \{\n\s+tokenToUse = snap\.data\(\)\.token;\n\s+\} else \{\n\s+throw new Error\(`الموظف \$\{employeeEmail\} لم يقم بربط حسابه بتقويم جوجل بعد\.`\);\n\s+\}\n\s+\} catch \(e\) \{\n\s+throw new Error\("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود\."\);\n\s+\}\n\s+\}'

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
  }'''

content = content.replace(update_regex, new_update)

# Also let's improve fetchGoogleAPI to catch 401 specifically
# Since we can't easily parse it if we aren't exact, I'll let it be for now.

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
