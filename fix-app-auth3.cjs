const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const authLogic = `    let isInitialCheck = true;
    const unsubscribeAuth = auth?.onAuthStateChanged?.((firebaseUser: any) => {
      const stored = localStorage.getItem("current_user");
      
      // If we are using mock auth (dummy_firestore or similar fallback without real auth)
      const isMockAuth = auth && auth.currentUser === null && !auth.onAuthStateChanged;
      
      if (stored && (firebaseUser || isMockAuth)) {
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
    }`;

c = c.replace(/let isInitialCheck = true;[\s\S]*?setLoading\(false\);\s*\}/m, authLogic);

fs.writeFileSync('src/App.tsx', c);
