const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!code.includes('<UserProfileModal')) {
  code = code.replace(
    '      </main>\n    </div>\n  );\n}',
    '      </main>\n      {showProfileModal && currentUserObj && (\n        <UserProfileModal \n          user={currentUserObj}\n          onClose={() => setShowProfileModal(false)}\n          onUpdate={(updated) => {\n             setCurrentUserObj(updated);\n             setUserName(updated.name);\n             setUserRoleAr(updated.roleAr || updated.role);\n             setUserPhoto(updated.photo);\n          }}\n        />\n      )}\n    </div>\n  );\n}'
  );
  fs.writeFileSync('src/components/Layout.tsx', code);
}
