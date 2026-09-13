import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

getShared_regex = r'export async function getSharedAccessToken\(\): Promise<string \| null> \{[\s\S]*?tokenPromise = null;\n  return token;\n\}'

new_getShared = r'''export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  const local = localStorage.getItem("google_access_token");
  if (local) {
     cachedAccessToken = local;
     return local;
  }

  // Temporary fallback during development if firestore read fails
  // Since you must authorize locally via AuthGate, `cachedAccessToken` or `local` MUST be set for successful OAuth flow.
  // We cannot bypass this without breaking security, but the current UI state means it should work.
  return null;
}'''

content = re.sub(getShared_regex, new_getShared, content)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
