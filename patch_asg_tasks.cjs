const fs = require('fs');
let content = fs.readFileSync('src/pages/AssistantSecGenTasks.tsx', 'utf8');

const newEffect = `  useEffect(() => {
    const q1 = query(collection(db, "tasks"));
    const q2 = query(collection(db, "affiliates_tasks"));
    const q3 = query(collection(db, "centers_tasks"));
    const q4 = query(collection(db, "assistant_sec_gen_tasks")); // Optional, if they also have their own tasks

    const unsub1 = onSnapshot(q1, (snapshot) => {
      const dbTasks = snapshot.docs.map(doc => ({ id: doc.id, _sourceCol: "tasks", ...doc.data() })) as (TaskItem & {_sourceCol: string})[];
      setTasks(prev => {
        const others = prev.filter(t => t._sourceCol !== "tasks");
        return [...others, ...dbTasks].sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      });
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      const dbTasks = snapshot.docs.map(doc => ({ id: doc.id, _sourceCol: "affiliates_tasks", ...doc.data() })) as (TaskItem & {_sourceCol: string})[];
      setTasks(prev => {
        const others = prev.filter(t => t._sourceCol !== "affiliates_tasks");
        return [...others, ...dbTasks].sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      });
    });

    const unsub3 = onSnapshot(q3, (snapshot) => {
      const dbTasks = snapshot.docs.map(doc => ({ id: doc.id, _sourceCol: "centers_tasks", ...doc.data() })) as (TaskItem & {_sourceCol: string})[];
      setTasks(prev => {
        const others = prev.filter(t => t._sourceCol !== "centers_tasks");
        return [...others, ...dbTasks].sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      });
    });

    const unsub4 = onSnapshot(q4, (snapshot) => {
      const dbTasks = snapshot.docs.map(doc => ({ id: doc.id, _sourceCol: "assistant_sec_gen_tasks", ...doc.data() })) as (TaskItem & {_sourceCol: string})[];
      setTasks(prev => {
        const others = prev.filter(t => t._sourceCol !== "assistant_sec_gen_tasks");
        return [...others, ...dbTasks].sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      });
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);`;

content = content.replace(
  /  useEffect\(\(\) => \{\n    const q = query\(collection\(db, "assistant_sec_gen_tasks"\)\);\n    const unsubscribe = onSnapshot\(q, \(snapshot\) => \{\n      const dbTasks = snapshot.docs.map\(doc => \(\{\n        id: doc.id,\n        \.\.\.doc.data\(\)\n      \}\)\) as TaskItem\[\];\n      setTasks\(dbTasks\);\n    \}\);\n    return \(\) => unsubscribe\(\);\n  \}, \[\]\);/g,
  newEffect
);

content = content.replace(/addDoc\(collection\(db, "assistant_sec_gen_tasks"\)/g, 'addDoc(collection(db, "assistant_sec_gen_tasks")'); // leave AS IS for adding
content = content.replace(/updateDoc\(doc\(db, "assistant_sec_gen_tasks", currentTask\.id\)/g, 'updateDoc(doc(db, (currentTask as any)._sourceCol || "assistant_sec_gen_tasks", currentTask.id)');
content = content.replace(/deleteDoc\(doc\(db, "assistant_sec_gen_tasks", taskToDeleteId\)/g, 'deleteDoc(doc(db, (tasks.find(t => t.id === taskToDeleteId) as any)?._sourceCol || "assistant_sec_gen_tasks", taskToDeleteId)');

fs.writeFileSync('src/pages/AssistantSecGenTasks.tsx', content);
