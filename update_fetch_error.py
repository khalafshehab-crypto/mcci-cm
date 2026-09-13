import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make absolutely sure that "customToken" error does not exist anymore.
# Let's check `fetchGoogleAPI`.

target = r'''      if (response.status === 401) {
        console.warn("Google API 401: Token expired. Requesting user to re-authenticate via UI...");'''

print("Target found: ", target in content)
