const req = { id: 'req1', name: 'Ahmed', phone: '1234', email: 'test@test.com' };
const disabledEmp = undefined;
const hasWorks = true;
const dbEmployees = [];
const linkChoice = true;

let parsedId = "";
if (hasWorks || disabledEmp) {
  if (linkChoice) {
    if (disabledEmp) {
      parsedId = disabledEmp.id;
    } else {
      parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      while (dbEmployees.some(emp => emp.id === parsedId)) {
        parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      }
    }
  } else {
    parsedId = Math.floor(1000 + Math.random() * 9000).toString();
    while (dbEmployees.some(emp => emp.id === parsedId)) {
      parsedId = Math.floor(1000 + Math.random() * 9000).toString();
    }
    req.name = req.name + " (جديد)";
  }
} else {
  parsedId = Math.floor(1000 + Math.random() * 9000).toString();
  while (dbEmployees.some(emp => emp.id === parsedId)) {
    parsedId = Math.floor(1000 + Math.random() * 9000).toString();
  }
}
console.log(parsedId, req.name);
