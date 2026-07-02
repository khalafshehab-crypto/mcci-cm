const fs = require('fs');
let content = fs.readFileSync('src/pages/AssistantSecGen.tsx', 'utf8');

const replacementEvents = `  const { data: dbEvents1 } = useFirestoreCollection<any>("assistant_sec_gen_events", []);
  const { data: dbEvents2 } = useFirestoreCollection<any>("events", []);
  const { data: dbEvents3 } = useFirestoreCollection<any>("affiliates_events", []);
  const { data: dbEvents4 } = useFirestoreCollection<any>("centers_events", []);
  const dbEvents = React.useMemo(() => [...dbEvents1, ...dbEvents2, ...dbEvents3, ...dbEvents4], [dbEvents1, dbEvents2, dbEvents3, dbEvents4]);`;

const replacementTasks = `  const { data: dbTasks1 } = useFirestoreCollection<any>("assistant_sec_gen_tasks", []);
  const { data: dbTasks2 } = useFirestoreCollection<any>("tasks", []);
  const { data: dbTasks3 } = useFirestoreCollection<any>("affiliates_tasks", []);
  const { data: dbTasks4 } = useFirestoreCollection<any>("centers_tasks", []);
  const dbTasks = React.useMemo(() => [...dbTasks1, ...dbTasks2, ...dbTasks3, ...dbTasks4], [dbTasks1, dbTasks2, dbTasks3, dbTasks4]);`;

content = content.replace(
  /  const \{ data: dbEvents \} = useFirestoreCollection<any>\("assistant_sec_gen_events", \[\]\);/,
  replacementEvents
);

content = content.replace(
  /  const \{ data: dbTasks \} = useFirestoreCollection<any>\("assistant_sec_gen_tasks", \[\]\);/,
  replacementTasks
);

fs.writeFileSync('src/pages/AssistantSecGen.tsx', content);
