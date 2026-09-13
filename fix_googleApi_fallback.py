import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the throw logic to completely bypass on permission denied
throw_regex = r'try \{\n\s+const tokenRef = doc\(db, "employee_tokens", employeeEmail.toLowerCase\(\)\);\n\s+const snap = await getDoc\(tokenRef\);\n\s+if \(snap.exists\(\) && snap.data\(\).token\) \{\n\s+tokenToUse = snap.data\(\).token;\n\s+\} else \{\n\s+console.warn\(`No token found in employee_tokens for \$\{employeeEmail\}, falling back to current user\'s token.`\);\n\s+\}\n\s+\} catch \(e\) \{\n\s+console.warn\("Failed to fetch employee token, falling back to current user\'s token.", e\);\n\s+\}'

# Actually, the try-catch already ignores the error!
# Let's check why it might still not sync.
# Maybe getSharedAccessToken() is returning null?
