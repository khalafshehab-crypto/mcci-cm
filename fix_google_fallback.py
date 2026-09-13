import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace throw new Error for missing token in create
throw_regex = r'\} else \{\n\s+throw new Error\("لم يقم هذا الموظف بتسجيل الدخول للسماح باستقبال المواعيد بعد\."\);\n\s+\}'
fallback = r'''} else {
        console.warn(`No token found in employee_tokens for ${employeeEmail}, falling back to current user's token.`);
      }'''
content = re.sub(throw_regex, fallback, content)

# Replace throw in catch block
catch_regex = r'\} catch \(e\) \{\n\s+console.warn\("Failed to fetch employee token[^\n]*", e\);\n\s+throw e;\n\s+\}'
catch_fallback = r'''} catch (e) {
      console.warn("Failed to fetch employee token, falling back to current user's token.", e);
    }'''
content = re.sub(catch_regex, catch_fallback, content)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done googleApi updates")
