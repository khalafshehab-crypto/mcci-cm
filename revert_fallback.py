import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix createGoogleCalendarEvent and updateGoogleCalendarEvent
regex_warn1 = r'console\.warn\(`No token found in employee_tokens for \$\{employeeEmail\}, falling back to current user\'s token.`\);'
throw1 = r'throw new Error(`الموظف ${employeeEmail} لم يقم بربط حسابه بتقويم جوجل بعد.`);'
content = re.sub(regex_warn1, throw1, content)

regex_warn2 = r'console\.warn\("Failed to fetch employee token, falling back to current user\'s token.", e\);'
throw2 = r'throw new Error("فشل في جلب رمز مصادقة الموظف أو أنه غير موجود.");'
content = re.sub(regex_warn2, throw2, content)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done reverting fallback.")
