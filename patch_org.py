import re

def patch_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    # 1. Add useFirestoreCollection for delegations
    new_coll = r'  const { data: dbDelegations, addDocument: addFirebaseDelegation, updateDocument: updateFirebaseDelegation } = useFirestoreCollection<any>("delegations", []);\n'
    content = content.replace('  const { data: dbTemplates, deleteDocument: deleteFirebaseTemplate } = useFirestoreCollection<any>("templates", []);', '  const { data: dbTemplates, deleteDocument: deleteFirebaseTemplate } = useFirestoreCollection<any>("templates", []);\n' + new_coll)

    # 2. Add sourceEmpStats
    stats_code = r"""  const sourceEmpStats = React.useMemo(() => {
    if (!sourceEmpId) return { committees: 0, tasks: 0, events: 0 };
    const sourceEmp = dbEmployees.find(emp => emp.id === sourceEmpId);
    const comms = dbCommittees.filter(c => c.specialistId === sourceEmpId).length;
    const tasks = dbTasks.filter(t => t.assignedToId === sourceEmpId || (sourceEmp && t.assignedTo === sourceEmp.name)).length;
    const events = dbEvents.filter(ev => ev.employeeId === sourceEmpId || ev.specialistId === sourceEmpId).length;
    return { committees: comms, tasks: tasks, events: events };
  }, [sourceEmpId, dbCommittees, dbTasks, dbEvents, dbEmployees]);

"""
    content = content.replace('  const handleTransferDuties = async (e: React.FormEvent) => {', stats_code + '  const handleTransferDuties = async (e: React.FormEvent) => {')

    # 3. Handle saving the delegation/transfer
    save_code = r"""      if (transferMode === "delegation" && delegatePermissions) {
        const currentTargetAllowed = targetEmp.allowedPages || [];
        const sourceAllowed = sourceEmp.allowedPages || [];
        const updatedAllowed = Array.from(new Set([...currentTargetAllowed, ...sourceAllowed]));
        await updateFirebaseEmp(targetEmpId, { allowedPages: updatedAllowed });
      }

      // Record delegation in db
      await addFirebaseDelegation({
        sourceEmpId,
        sourceEmpName: sourceEmp.name,
        targetEmpId,
        targetEmpName: targetEmp.name,
        transferMode,
        delegationEndDate: transferMode === "delegation" ? delegationEndDate : "",
        transferCommittees,
        transferTasks,
        transferEvents,
        delegatePermissions: transferMode === "delegation" ? delegatePermissions : false,
        timestamp: new Date().toISOString(),
        status: "active"
      });
"""
    content = re.sub(r'      if \(transferMode === "delegation" && delegatePermissions\) \{.*?\n      \}', save_code, content, flags=re.DOTALL)

    # 4. Modify the checkboxes to show numbers
    content = content.replace('<span>اللجان القطاعية</span>', '<span>اللجان القطاعية ({sourceEmpStats.committees})</span>')
    content = content.replace('<span>المهام والمتابعة</span>', '<span>المهام والمتابعة ({sourceEmpStats.tasks})</span>')
    content = content.replace('<span>الفعاليات</span>', '<span>الفعاليات ({sourceEmpStats.events})</span>')

    with open(filename, "w") as f:
        f.write(content)

patch_file("src/pages/OrgChart.tsx")
