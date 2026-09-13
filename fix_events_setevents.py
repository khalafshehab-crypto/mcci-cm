import re

with open('src/pages/Events.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_1 = r'''      setEvents(events.map(ev => ev.id === editingEvent.id ? {
        ...ev,
        title: newTitle,
        type: newType,
        date: newDate,
        time: singleTime,
        committeeId: newCommitteeId,
        committeeName: commName,
        status: newStatus,
        location: singleRoom,
        employees: [singleEmployee].filter(Boolean),
        members: newMembers,
        notes: newNotes
      } : ev));'''

new_1 = r'''      updateFirebaseEvent(String(editingEvent.id), {
        ...editingEvent,
        title: newTitle,
        type: newType,
        date: newDate,
        time: singleTime,
        committeeId: newCommitteeId,
        committeeName: commName,
        status: newStatus,
        location: singleRoom,
        employees: [singleEmployee].filter(Boolean),
        members: newMembers,
        notes: newNotes
      });'''

old_2 = r'''      setEvents([
        {
          id: Date.now(),
          title: newTitle,
          type: newType,
          date: newDate,
          time: singleTime,
          committeeId: newCommitteeId,
          committeeName: commName,
          status: newStatus,
          location: singleRoom,
          employees: [singleEmployee].filter(Boolean),
          members: newMembers,
          notes: newNotes
        },
        ...events
      ]);'''

new_2 = r'''      addFirebaseEvent({
          id: Date.now(),
          title: newTitle,
          type: newType,
          date: newDate,
          time: singleTime,
          committeeId: newCommitteeId,
          committeeName: commName,
          status: newStatus,
          location: singleRoom,
          employees: [singleEmployee].filter(Boolean),
          members: newMembers,
          notes: newNotes
      });'''

content = content.replace(old_1, new_1)
content = content.replace(old_2, new_2)

with open('src/pages/Events.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
