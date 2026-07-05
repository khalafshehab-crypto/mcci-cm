const fs = require('fs');
const file = 'src/pages/AssistantSecGen.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const filtersStart = lines.findIndex(l => l.includes('// Filters for notifications center'));
const alarmsStart = lines.findIndex(l => l.includes('const [alarms, setAlarms] = useState<Alarm[]>([])'));

if (filtersStart !== -1 && alarmsStart !== -1 && filtersStart > alarmsStart) {
  // Extract the filter lines (there are 5 lines including comment)
  const filterBlock = lines.splice(filtersStart, 5);
  // Insert before alarmsStart (which is now shifted by whatever, actually alarmsStart is before so it's not shifted)
  lines.splice(alarmsStart, 0, ...filterBlock);
  fs.writeFileSync(file, lines.join('\n'));
  console.log("Moved filters");
} else {
  console.log("Could not find or already moved", filtersStart, alarmsStart);
}
