import fs from 'fs';
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(
  'const { data: dbEmployees, addDocument: addFirebaseEmp, updateDocument: updateFirebaseEmp, deleteDocument: deleteFirebaseEmp, loading: employeesLoading } = useFirestoreCollection<Employee>("employees", []);',
  'const { data: dbEmployees, addDocument: addFirebaseEmp, setDocument: setFirebaseEmp, updateDocument: updateFirebaseEmp, deleteDocument: deleteFirebaseEmp, loading: employeesLoading } = useFirestoreCollection<Employee>("employees", []);'
);

code = code.replace(
  'await updateFirebaseEmp(parsedId, payload);',
  'await setFirebaseEmp(parsedId, payload);'
);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
