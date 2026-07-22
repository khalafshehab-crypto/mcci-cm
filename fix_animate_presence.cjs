const fs = require('fs');

function fixKeys(file) {
  let code = fs.readFileSync(file, 'utf8');

  // We find <AnimatePresence> and the following {isOpen && (<div className="fixed ...">)}
  // We'll replace <div className="fixed" with <div key="some-modal" className="fixed"
  let count = 0;
  code = code.replace(/<AnimatePresence>\s*\{\s*([a-zA-Z0-9_]+)\s*&&\s*\(\s*<div\s+className="/g, (match, cond) => {
    count++;
    return `<AnimatePresence>\n        {${cond} && (\n          <div key="${cond}-modal" className="`;
  });
  
  // also handle the one with `{isShareOpen && templateToShare && (`
  code = code.replace(/<AnimatePresence>\s*\{\s*isShareOpen\s*&&\s*templateToShare\s*&&\s*\(\s*<div\s+className="/g, () => {
    count++;
    return `<AnimatePresence>\n        {isShareOpen && templateToShare && (\n          <div key="share-modal" className="`;
  });

  fs.writeFileSync(file, code);
  console.log(`Patched ${count} AnimatePresence keys in ${file}`);
}

fixKeys('src/pages/CommitteesLibrary.tsx');
fixKeys('src/pages/Library.tsx');
