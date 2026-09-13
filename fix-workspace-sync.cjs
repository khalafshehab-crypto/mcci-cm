const fs = require('fs');
let c = fs.readFileSync('src/lib/workspaceSync.ts', 'utf8');

c = c.replace(/export async function syncUserWorkspace\(currentUser: Employee\) \{/, `export async function syncUserWorkspace(currentUser: Employee) {
  // Only sync if real auth user is present to avoid missing permissions
  const { auth } = await import("./firebase");
  if (!auth || !auth.currentUser) return;`);

fs.writeFileSync('src/lib/workspaceSync.ts', c);
