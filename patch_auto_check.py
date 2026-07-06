import re

def patch_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    new_effect = r"""  const sourceEmpStats = React.useMemo(() => {
    if (!sourceEmpId) return { committees: 0, tasks: 0, events: 0 };
    const sourceEmp = dbEmployees.find(emp => emp.id === sourceEmpId);
    const comms = dbCommittees.filter(c => c.specialistId === sourceEmpId || (sourceEmp && c.specialistName === sourceEmp.name)).length;
    const tasks = dbTasks.filter(t => t.assignedToId === sourceEmpId || (sourceEmp && t.assignedTo === sourceEmp.name)).length;
    const events = dbEvents.filter(ev => ev.employeeId === sourceEmpId || ev.specialistId === sourceEmpId || (sourceEmp && ev.specialistName === sourceEmp.name)).length;
    return { committees: comms, tasks: tasks, events: events };
  }, [sourceEmpId, dbCommittees, dbTasks, dbEvents, dbEmployees]);

  React.useEffect(() => {
    if (sourceEmpStats) {
      setTransferCommittees(sourceEmpStats.committees > 0);
      setTransferTasks(sourceEmpStats.tasks > 0);
      setTransferEvents(sourceEmpStats.events > 0);
    }
  }, [sourceEmpStats]);
"""

    content = re.sub(r'  const sourceEmpStats = React\.useMemo\(\(\) => \{.*?\n  \}, \[sourceEmpId, dbCommittees, dbTasks, dbEvents, dbEmployees\]\);', new_effect, content, flags=re.DOTALL)

    # Disable checkboxes if 0
    content = content.replace('<input type="checkbox" checked={transferCommittees}', '<input type="checkbox" disabled={sourceEmpStats.committees === 0} checked={transferCommittees}')
    content = content.replace('<input type="checkbox" checked={transferTasks}', '<input type="checkbox" disabled={sourceEmpStats.tasks === 0} checked={transferTasks}')
    content = content.replace('<input type="checkbox" checked={transferEvents}', '<input type="checkbox" disabled={sourceEmpStats.events === 0} checked={transferEvents}')


    with open(filename, "w") as f:
        f.write(content)

patch_file("src/pages/OrgChart.tsx")
