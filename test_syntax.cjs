const fs = require('fs');
try {
  // Just parsing the file to make sure no syntax errors at least
  // Not a full TS compile but good enough for missing braces
  require('@babel/core').transformFileSync('src/pages/CommitteesMembers.tsx', {presets: ['@babel/preset-react', '@babel/preset-typescript']});
  console.log("No syntax errors");
} catch(e) {
  console.log("Error: " + e.message);
}
