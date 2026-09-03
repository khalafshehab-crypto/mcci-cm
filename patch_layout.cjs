const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const target = `
  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isProfileComplete === false && location.pathname !== "/system-logs") {
          setTimeout(() => setShowProfileModal(true), 500);
        }
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setCurrentUserObj(parsed);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.roleAr) setUserRoleAr(parsed.roleAr || "أخصائي اللجان");
          if (parsed.photo) setUserPhoto(parsed.photo);
        }
      }
    } catch (e) { /* ignore */ }
  }, [location.pathname]);
`;

const replacement = `
  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isProfileComplete === false && location.pathname !== "/system-logs") {
          setTimeout(() => setShowProfileModal(true), 500);
        }
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setCurrentUserObj(parsed);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.roleAr) setUserRoleAr(parsed.roleAr || "أخصائي اللجان");
          if (parsed.photo) setUserPhoto(parsed.photo);
        }
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (user) {
      setCurrentUserObj(user);
      if (user.name) setUserName(user.name);
      if (user.roleAr) setUserRoleAr(user.roleAr || "أخصائي اللجان");
      if (user.photo) setUserPhoto(user.photo);
      
      if (user.isProfileComplete === false && location.pathname !== "/system-logs") {
        setTimeout(() => setShowProfileModal(true), 500);
      }
    }
  }, [user, location.pathname]);
`;

code = code.replace(target.trim(), replacement.trim());
fs.writeFileSync('src/components/Layout.tsx', code);
