import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Also let's clean up `fetchGoogleAPI` customToken error block
target = r'''      if (response.status === 401) {
        if (customToken) {
           console.warn("Target user token expired. Failing silently instead of asking the current user.");
           throw new Error("Target user token expired.");
        }
        console.warn("Google API 401: Token expired. Requesting user to re-authenticate via UI...");'''

replacement = r'''      if (response.status === 401) {
        console.warn("Google API 401: Token expired. Requesting user to re-authenticate via UI...");'''

content = content.replace(target, replacement)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
