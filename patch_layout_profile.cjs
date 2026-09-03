const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!code.includes('import UserProfileModal')) {
  code = code.replace(
    'import { motion, AnimatePresence } from "motion/react";',
    'import { motion, AnimatePresence } from "motion/react";\nimport UserProfileModal from "./UserProfileModal";'
  );
}

if (!code.includes('const [showProfileModal')) {
  code = code.replace(
    'const [currentUserObj, setCurrentUserObj] = useState<any>(null);',
    'const [currentUserObj, setCurrentUserObj] = useState<any>(null);\n  const [showProfileModal, setShowProfileModal] = useState(false);'
  );
}

if (!code.includes('if (currentUserObj && currentUserObj.isProfileComplete === false)')) {
  code = code.replace(
    'const stored = localStorage.getItem("current_user");',
    'const stored = localStorage.getItem("current_user");\n      if (stored) {\n        const parsed = JSON.parse(stored);\n        if (parsed.isProfileComplete === false && location.pathname !== "/system-logs") {\n          setTimeout(() => setShowProfileModal(true), 500);\n        }\n      }'
  );
}

if (!code.includes('<span>الملف الشخصي</span>')) {
  code = code.replace(
    '<button \n                      type="button"\n                      onClick={() => {',
    '<button\n                      type="button"\n                      onClick={() => { setShowProfileModal(true); setActiveDropdown(null); }}\n                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-[11px] font-black transition-all border border-gray-200 mb-2"\n                    >\n                      <User className="w-4 h-4" />\n                      <span>الملف الشخصي</span>\n                    </button>\n                    <button \n                      type="button"\n                      onClick={() => {'
  );
}

if (!code.includes('<UserProfileModal')) {
  code = code.replace(
    '</ErrorBoundary>\n    </div>',
    '</ErrorBoundary>\n      {showProfileModal && currentUserObj && (\n        <UserProfileModal \n          user={currentUserObj}\n          onClose={() => setShowProfileModal(false)}\n          onUpdate={(updated) => {\n             setCurrentUserObj(updated);\n             setUserName(updated.name);\n             setUserRoleAr(updated.roleAr || updated.role);\n             setUserPhoto(updated.photo);\n          }}\n        />\n      )}\n    </div>'
  );
}

fs.writeFileSync('src/components/Layout.tsx', code);
