import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_auth_logic(content, func_name):
    # Regex to find the whole start of the function until the closing brace of the if(employeeEmail) block
    pattern = rf'export async function {func_name}\(.*?\): Promise<any> \{\n\s+let tokenToUse: string \| undefined = undefined;\n\s+if \(employeeEmail\) \{\n\s+try \{\n\s+const tokenRef = doc\(db, "employee_tokens", employeeEmail\.toLowerCase\(\)\);\n\s+const snap = await getDoc\(tokenRef\);\n\s+if \(snap\.exists\(\) && snap\.data\(\)\.token\) \{\n\s+tokenToUse = snap\.data\(\)\.token;\n\s+\} else \{\n\s+throw new Error\(`الموظف \$\{{employeeEmail\}}\} لم يقم بربط حسابه بتقويم جوجل بعد\.`\);\n\s+\}\n\s+\} catch \(e\) \{\n\s+throw new Error\("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود\."\);\n\s+\}\n\s+\}'
    
    replacement = f'''export async function {func_name}(event: any, employeeEmail?: string): Promise<any> {{ // Replaced header
  let tokenToUse: string | undefined = undefined;
  if (employeeEmail) {{
    const isCurrentUser = auth.currentUser?.email?.toLowerCase() === employeeEmail.toLowerCase();
    if (!isCurrentUser) {{
      try {{
        const tokenRef = doc(db, "employee_tokens", employeeEmail.toLowerCase());
        const snap = await getDoc(tokenRef);
        if (snap.exists() && snap.data().token) {{
          tokenToUse = snap.data().token;
        }} else {{
          throw new Error(`الموظف ${{employeeEmail}} لم يقم بربط حسابه بتقويم جوجل بعد.`);
        }}
      }} catch (e: any) {{
        if (e.message && e.message.includes("الموظف")) throw e;
        throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");
      }}
    }}
  }}'''
    return re.sub(pattern, replacement, content, flags=re.DOTALL)


# Manual replace because regex can be tricky with formatting changes
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
