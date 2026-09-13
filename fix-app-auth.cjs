const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/const checkUser = \(\) => \{[\s\S]*?checkUser\(\);/m, `    let isInitialCheck = true;
    const unsubscribeAuth = auth?.onAuthStateChanged?.((firebaseUser: any) => {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
          if (firebaseUser) {
            import("./lib/workspaceSync").then(m => m.syncUserWorkspace(parsedUser));
          }
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      if (isInitialCheck) {
        setLoading(false);
        isInitialCheck = false;
      }
    });

    // Fallback if auth is mock
    if (auth && auth.currentUser === null && !auth.onAuthStateChanged) {
        const stored = localStorage.getItem("current_user");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch (e) {
            setUser(null);
          }
        }
        setLoading(false);
    }
`);

c = c.replace(/window\.addEventListener\("storage", checkUser\);/g, '');
c = c.replace(/window\.removeEventListener\("storage", checkUser\);/g, 'if (unsubscribeAuth) unsubscribeAuth();');

fs.writeFileSync('src/App.tsx', c);
