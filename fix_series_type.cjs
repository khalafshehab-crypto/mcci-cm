const fs = require('fs');

let eContent = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf-8');

const target = `const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx,
      title: gen.title,
      type: "مفردة",`;

const replacement = `const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx,
      title: gen.title,
      type: "متسلسلة",`;

if (eContent.includes(target)) {
  eContent = eContent.replace(target, replacement);
  fs.writeFileSync('src/pages/CommitteesEvents.tsx', eContent);
  console.log("Patched series type successfully!");
} else {
  console.log("Could not find the target string.");
}

