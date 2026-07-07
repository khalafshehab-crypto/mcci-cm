import re

with open('src/pages/CommitteesRecommendations.tsx', 'r') as f:
    content = f.read()

# I will just find handleOpenEdit and cut until handleDelete, then insert the correct versions.
start_str = "    setIsAddOpen(true);\n  };\n\n  const handleOpenDelete = (evt: EventItem) => {"
end_str = "  const handleDelete = () => {"

if start_str in content and end_str in content:
    start_idx = content.find("  const handleOpenDelete = (evt: EventItem) => {")
    end_idx = content.find("  const handleDelete = () => {")
    
    print(f"Found at {start_idx} and {end_idx}")
    
    correct_code = """  const handleOpenDelete = (evt: EventItem) => {
    if (!canUserEditCommittee(evt.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لحذف هذه الفعالية. يمكنك فقط تعديل فعاليات اللجان المكلف بها.");
      return;
    }
    setDeletingEvent(evt);
  };

  const toggleSeriesRoom = (rm: string) => {
    if (seriesRooms.includes(rm)) {
      setSeriesRooms(seriesRooms.filter(r => r !== rm));
    } else {
      setSeriesRooms([...seriesRooms, rm]);
    }
  };

  const generateDates = () => {
    if (!seriesStartDate || !seriesEndDate) return;
    const start = new Date(seriesStartDate);
    const end = new Date(seriesEndDate);
    const targetDay = DAYSMaps[seriesDayOfWeek];
    const targetWeek = WEEKSMap[seriesWeekOfMonth];
    
    const results: {id: number, date: string, title: string, time: string}[] = [];
    if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات لهذه اللجنة"); return; }
    const classifStr = seriesClassification === "دوري" ? "الدوري" : seriesClassification === "استثنائي" ? "الاستثنائي" : seriesClassification === "طارئ" ? "الطارئ" : seriesClassification === "فريق عمل" ? "فريق العمل" : seriesClassification;
    const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
    const prefixToMatch = (seriesKind === "اجتماع" ? `${seriesKind} ${formattedCommName} ${classifStr}` : `${seriesKind} ${formattedCommName}`).trim();
    let existingCount = events.filter(e => e.committeeId === newCommitteeId && e.title.startsWith(prefixToMatch)).length;
    
    const current = new Date(start);
    let tempId = 1;
    while (current <= end) {
      if (current.getDay() === targetDay) {
        // Occurrence is 0-indexed in month
        const dateNo = current.getDate();
        const occurrence = Math.floor((dateNo - 1) / 7);
        if (occurrence === targetWeek) {
          existingCount++;
          const numWord = getArabicOrdinal(existingCount);
          let itemTitle = `${prefixToMatch} ${numWord}`.trim();
          if (seriesKind === "اجتماع" && seriesClassification === "دوري" && numWord === "الأول") {
            itemTitle += " (التأسيسي)";
          }
          results.push({
            id: tempId++,
            date: new Date(current).toISOString().split('T')[0],
            title: itemTitle,
            time: seriesTime
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    setGeneratedSchedules(results);
    setSelectedSchedules(results.map(r => r.id));
    setIsConfirmingSeries(true);
  };

  const [conflictWarning, setConflictWarning] = useState<{message: string, conflictingEventId: number} | null>(null);

  const checkConflict = (date: string, time: string, rooms: string[], employees: string[], excludeId?: number) => {
    for (const evt of events) {
      if (excludeId && evt.id === excludeId) continue;
      if (evt.date === date && evt.time === time) {
        const evtRooms = evt.location.split('،').map(r => r.trim());
        const overlappingRooms = rooms.filter(r => evtRooms.includes(r));
        if (overlappingRooms.length > 0) {
          return { message: `يوجد تعارض في القاعة (${overlappingRooms.join('، ')}) مع فعالية: ${evt.title}`, conflictingEventId: evt.id };
        }
        const overlappingEmps = employees.filter(e => evt.employees.includes(e));
        if (overlappingEmps.length > 0) {
          return { message: `يوجد تعارض للموظف (${overlappingEmps.join('، ')}) مع فعالية: ${evt.title}`, conflictingEventId: evt.id };
        }
      }
    }
    return null;
  };

  const handleInsertSeries = () => {
    if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات أو مهام لهذه اللجنة"); return; }
    const selectedGen = generatedSchedules.filter(s => selectedSchedules.includes(s.id));
    
    // Check conflicts
    for (const gen of selectedGen) {
      const conflict = checkConflict(gen.date, gen.time, seriesRooms, [seriesAssignedEmployee].filter(Boolean));
      if (conflict) {
        setConflictWarning(conflict);
        return;
      }
    }

    const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx, // unique ID
      title: gen.title,
      type: "م مفردة",
      date: gen.date,
      time: gen.time,
      committeeId: newCommitteeId,
      committeeName: commName,
      status: "تجهيز التوصية والمسودة",
      location: seriesRooms.length > 0 ? seriesRooms.join("، ") : "حضوري",
      employees: [seriesAssignedEmployee].filter(Boolean),
      members: newMembers,
      notes: newNotes,
      exportedRecommendationsToPage: true,
    }));
    // fix previously set wrong type
    newEventsList.forEach(e => e.type = "مفردة");

    setEvents([...newEventsList, ...events]);
    setIsConfirmingSeries(false);
    setIsAddOpen(false);
    setShowSuccessMsg(true);
    setConflictWarning(null);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);
    
    if (newType === "متسلسلة") {
      // This is handled by handleImportSelected now, but just in case
      return;
    }
    if (!newRecTitle.trim() || !newCommitteeId) return;

    if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات أو مهام لهذه اللجنة"); return; }
    const eventName = events.find(ev => ev.id === Number(newRecEventId))?.title || "توصية بالتمرير";

    if (editingEvent) {
      const updatedRec = {
        ...editingEvent,
        title: newRecTitle,
        description: newRecText,
        committeeName: commName,
        eventName: eventName,
        assignedTo: newRecAssignee,
        duration: newRecDuration,
        department: "إدارة اللجان",
        attachments: newRecAttachments ? [{ id: '1', name: newRecAttachments, url: '#' }] : (editingEvent.attachments || [])
      };
      
      // Update the recommendation in the db
      updateDoc(doc(db, "recommendations", String(editingEvent.id)), updatedRec).catch(console.error);
    } else {
      const recId = String(Date.now() + Math.floor(Math.random() * 1000));
      const newRec: any = {
        id: recId,
        title: newRecTitle,
        description: newRecText,
        committeeName: commName,
        eventName: eventName,
        date: new Date().toISOString().split("T")[0],
        status: "جديدة",
        approvalStage: "أخصائي",
        assignedTo: newRecAssignee,
        duration: newRecDuration,
        department: "إدارة اللجان",
        attachments: newRecAttachments ? [{ id: '1', name: newRecAttachments, url: '#' }] : [],
        auditLogs: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: "إنشاء توصية منفصلة",
            user: "أخصائي اللجنة"
          }
        ]
      };
      
      // Add recommendation in the db
      setDoc(doc(db, "recommendations", recId), newRec).catch(console.error);
    }

    // Clear form
    setNewRecTitle("");
    setNewRecDiscussion("");
    setNewRecText("");
    setNewRecAssignee("");
    setNewRecDuration("");
    setNewRecAttachments([]);
    setNewCommitteeId(0);
    
    setIsAddOpen(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

"""
    new_content = content[:start_idx] + correct_code + content[end_idx:]
    with open('src/pages/CommitteesRecommendations.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print("Could not find start or end")

