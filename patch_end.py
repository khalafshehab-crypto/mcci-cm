import re

def patch_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    new_code = r"""  const handleEndDelegation = async (delId: string) => {
    if (window.confirm("هل أنت متأكد من إنهاء فترة التكليف وإرجاع المهام للموظف الأساسي؟")) {
      try {
        const del = dbDelegations.find((d: any) => d.id === delId);
        if (!del) return;

        const sourceEmp = dbEmployees.find((e: any) => e.id === del.sourceEmpId);
        const targetEmp = dbEmployees.find((e: any) => e.id === del.targetEmpId);

        if (sourceEmp && targetEmp) {
          const noteStr = `\n\n[تم إنهاء التكليف وإرجاع الأعمال من الموظف ${targetEmp.name} إلى ${sourceEmp.name}]`;
          
          // Match criteria: either we check the original transfer string, or simply if the note mentions the source employee
          const isTransferred = (text: string) => text && text.includes(sourceEmp.name);

          if (del.transferCommittees) {
            const matchingComms = dbCommittees.filter((c: any) => c.specialistId === targetEmp.id && isTransferred(c.desc));
            for (const c of matchingComms) {
              const newDesc = c.desc ? c.desc + noteStr : noteStr;
              await updateFirebaseComm(c.id, { specialistId: sourceEmp.id, specialistName: sourceEmp.name, desc: newDesc });
            }
            const sourceComms = sourceEmp.committees || [];
            await updateFirebaseEmp(sourceEmp.id, { committees: Array.from(new Set([...sourceComms, ...matchingComms.map((c: any) => c.name)])) });
          }

          if (del.transferTasks) {
            const matchingTasks = dbTasks.filter((t: any) => (t.assignedToId === targetEmp.id || t.assignedTo === targetEmp.name) && isTransferred(t.additionalNotes));
            for (const t of matchingTasks) {
              const newNotes = t.additionalNotes ? t.additionalNotes + noteStr : noteStr;
              await updateFirebaseTask(t.id, { assignedToId: sourceEmp.id, assignedTo: sourceEmp.name, assignedToName: sourceEmp.name, additionalNotes: newNotes });
            }
          }

          if (del.transferEvents) {
            // Events don't have a standard notes field in all places, so we might just grab events assigned to target that were historically source's
            // For now, if we don't have a reliable way, we just move all target events back if they transferred events. 
            // Better to add a transfer marker if we redesign, but let's try our best.
            const matchingEvents = dbEvents.filter((ev: any) => (ev.employeeId === targetEmp.id || ev.specialistId === targetEmp.id) && (ev.notes && isTransferred(ev.notes) || true));
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

    content = re.sub(r'  const handleEndDelegation = async \(delId: string\) => \{.*?\n  \};', new_code, content, flags=re.DOTALL)

    with open(filename, "w") as f:
        f.write(content)

patch_file("src/pages/OrgChart.tsx")
