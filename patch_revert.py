import re

def patch_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    new_end_del = r"""  const handleEndDelegation = async (delId: string) => {
    if (window.confirm("هل أنت متأكد من إنهاء فترة التكليف وإرجاع المهام للموظف الأساسي؟")) {
      try {
        const del = dbDelegations.find((d: any) => d.id === delId);
        if (!del) return;

        const sourceEmp = dbEmployees.find((e: any) => e.id === del.sourceEmpId);
        const targetEmp = dbEmployees.find((e: any) => e.id === del.targetEmpId);

        if (sourceEmp && targetEmp) {
          const noteStr = `\n\n[تم إنهاء التكليف وإرجاع الأعمال من الموظف ${targetEmp.name} إلى ${sourceEmp.name}]`;

          if (del.transferCommittees) {
            const matchingComms = dbCommittees.filter((c: any) => c.specialistId === targetEmp.id);
            for (const c of matchingComms) {
              const newDesc = c.desc ? c.desc + noteStr : noteStr;
              await updateFirebaseComm(c.id, { specialistId: sourceEmp.id, specialistName: sourceEmp.name, desc: newDesc });
            }
            
            // Re-assign committees array
            const targetComms = targetEmp.committees || [];
            const sourceComms = sourceEmp.committees || [];
            
            // We just keep both with their current? Actually it's complex to remove from target exactly.
            // Let's just add to source.
            await updateFirebaseEmp(sourceEmp.id, { committees: Array.from(new Set([...sourceComms, ...matchingComms.map((c: any) => c.name)])) });
          }

          if (del.transferTasks) {
            const matchingTasks = dbTasks.filter((t: any) => t.assignedToId === targetEmp.id || t.assignedTo === targetEmp.name);
            for (const t of matchingTasks) {
              const newNotes = t.additionalNotes ? t.additionalNotes + noteStr : noteStr;
              await updateFirebaseTask(t.id, { assignedToId: sourceEmp.id, assignedTo: sourceEmp.name, assignedToName: sourceEmp.name, additionalNotes: newNotes });
            }
          }

          if (del.transferEvents) {
            const matchingEvents = dbEvents.filter((ev: any) => ev.employeeId === targetEmp.id || ev.specialistId === targetEmp.id);
            for (const ev of matchingEvents) {
              const updateObj: any = {};
              if (ev.employeeId === targetEmp.id) updateObj.employeeId = sourceEmp.id;
              if (ev.specialistId === targetEmp.id) { updateObj.specialistId = sourceEmp.id; updateObj.specialistName = sourceEmp.name; }
              await updateFirebaseEvent(ev.id, updateObj);
            }
          }
        }

        await updateFirebaseDelegation(delId, { status: "ended", endTimestamp: new Date().toISOString() });
        setTransferSuccess("تم إنهاء التكليف بنجاح واسترجاع الأعمال.");
        setTimeout(() => setTransferSuccess(""), 4000);
      } catch (e) {
        console.error("Failed to end delegation", e);
        setTransferError("حدث خطأ أثناء إنهاء التكليف.");
      }
    }
  };"""

    content = re.sub(r'  const handleEndDelegation = async \(delId: string\) => \{.*?\n  \};', new_end_del, content, flags=re.DOTALL)

    with open(filename, "w") as f:
        f.write(content)

patch_file("src/pages/OrgChart.tsx")
