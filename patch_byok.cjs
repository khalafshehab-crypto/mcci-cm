const fs = require('fs');

function patchOrgChart() {
  let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');
  content = content.replace(
    /value=\{localStorage\.getItem\('BYOK_GEMINI_API_KEY'\) \|\| ''\}\n\s*onChange=\{\(e\) => \{\n\s*if \(e\.target\.value\) \{\n\s*localStorage\.setItem\('BYOK_GEMINI_API_KEY', e\.target\.value\);\n\s*\} else \{\n\s*localStorage\.removeItem\('BYOK_GEMINI_API_KEY'\);\n\s*\}/g,
    `value={localStorage.getItem('BYOK_GEMINI_API_KEY') || ''}
                  onChange={async (e) => {
                    const newVal = e.target.value;
                    if (newVal) {
                      localStorage.setItem('BYOK_GEMINI_API_KEY', newVal);
                    } else {
                      localStorage.removeItem('BYOK_GEMINI_API_KEY');
                    }
                    if (currentUser && currentUser.id) {
                      const updatedUser = { ...currentUser, geminiApiKey: newVal };
                      localStorage.setItem('current_user', JSON.stringify(updatedUser));
                      await updateFirebaseEmp(currentUser.id, updatedUser);
                    }`
  );
  
  if (!content.includes('geminiApiKey?: string;')) {
    content = content.replace(
      /export interface Employee \{/,
      "export interface Employee {\n  geminiApiKey?: string;"
    );
  }
  
  fs.writeFileSync('src/pages/OrgChart.tsx', content);
}

function patchApp() {
  let content = fs.readFileSync('src/App.tsx', 'utf8');
  content = content.replace(
    /localStorage\.setItem\("current_user", freshString\);/g,
    `localStorage.setItem("current_user", freshString);
              if (freshUser.geminiApiKey) {
                localStorage.setItem("BYOK_GEMINI_API_KEY", freshUser.geminiApiKey);
              } else {
                localStorage.removeItem("BYOK_GEMINI_API_KEY");
              }`
  );
  fs.writeFileSync('src/App.tsx', content);
}

function patchAuthGate() {
  let content = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');
  
  content = content.replace(
    /localStorage\.setItem\("current_user", JSON\.stringify\(existingAdmin\)\);/g,
    `localStorage.setItem("current_user", JSON.stringify(existingAdmin));
        if (existingAdmin.geminiApiKey) {
          localStorage.setItem("BYOK_GEMINI_API_KEY", existingAdmin.geminiApiKey);
        } else {
          localStorage.removeItem("BYOK_GEMINI_API_KEY");
        }`
  );
  
  content = content.replace(
    /localStorage\.setItem\("current_user", JSON\.stringify\(adminEmp\)\);/g,
    `localStorage.setItem("current_user", JSON.stringify(adminEmp));
      if (adminEmp.geminiApiKey) {
        localStorage.setItem("BYOK_GEMINI_API_KEY", adminEmp.geminiApiKey);
      } else {
        localStorage.removeItem("BYOK_GEMINI_API_KEY");
      }`
  );
  
  content = content.replace(
    /localStorage\.setItem\("current_user", JSON\.stringify\(matchedEmployee\)\);/g,
    `localStorage.setItem("current_user", JSON.stringify(matchedEmployee));
      if (matchedEmployee.geminiApiKey) {
        localStorage.setItem("BYOK_GEMINI_API_KEY", matchedEmployee.geminiApiKey);
      } else {
        localStorage.removeItem("BYOK_GEMINI_API_KEY");
      }`
  );
  
  content = content.replace(
    /localStorage\.setItem\("current_user", JSON\.stringify\(newEmp\)\);/g,
    `localStorage.setItem("current_user", JSON.stringify(newEmp));
      if (newEmp.geminiApiKey) {
        localStorage.setItem("BYOK_GEMINI_API_KEY", newEmp.geminiApiKey);
      } else {
        localStorage.removeItem("BYOK_GEMINI_API_KEY");
      }`
  );

  fs.writeFileSync('src/components/AuthGate.tsx', content);
}

patchOrgChart();
patchApp();
patchAuthGate();
