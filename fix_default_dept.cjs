const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

// We will fix the default department selection in handleOpenAdd
const originalInit = `    setSelectedAssignDept("إدارة اللجان");
    const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === "إدارة اللجان" || emp.orgLevel2 === "إدارة اللجان" || emp.orgLevel1 === "إدارة اللجان");
    setAssignedTo(deptEmps.length > 0 ? deptEmps[0].name : (employeesList[0] || ""));`;

const replacementInit = `    const availableDepts = Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean)));
    const defaultDept = availableDepts.includes("إدارة اللجان") ? "إدارة اللجان" : (availableDepts[0] as string || "");
    setSelectedAssignDept(defaultDept);
    const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === defaultDept || emp.orgLevel2 === defaultDept || emp.orgLevel1 === defaultDept);
    setAssignedTo(deptEmps.length > 0 ? deptEmps[0].name : (employeesList[0] || ""));`;

if (code.includes(originalInit)) {
    code = code.replace(originalInit, replacementInit);
    fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
    console.log("Fixed handleOpenAdd");
} else {
    console.log("Could not find handleOpenAdd init logic");
}

// And also fix it in openActionModal where we open Edit Modal
const originalEditInit = `    // Find department of assignedTo
    const emp = allEmployeesData.find(e => e.name === task.assignedTo);
    if (emp && (emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1)) {
      setSelectedAssignDept((emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1) as string);
    } else {
      setSelectedAssignDept("إدارة اللجان");
    }`;

const replacementEditInit = `    // Find department of assignedTo
    const emp = allEmployeesData.find(e => e.name === task.assignedTo);
    if (emp && (emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1)) {
      setSelectedAssignDept((emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1) as string);
    } else {
      const availableDepts = Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean)));
      const defaultDept = availableDepts.includes("إدارة اللجان") ? "إدارة اللجان" : (availableDepts[0] as string || "");
      setSelectedAssignDept(defaultDept);
    }`;

if (code.includes(originalEditInit)) {
    code = code.replace(originalEditInit, replacementEditInit);
    fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
    console.log("Fixed openActionModal");
} else {
    console.log("Could not find openActionModal init logic");
}

