const fs = require('fs');
let content = fs.readFileSync('src/pages/Events.tsx', 'utf-8');

const target = `    const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx, // unique ID
      title: gen.title,
      type: "م مفردة",
      date: gen.date,
      time: gen.time,
      committeeId: newCommitteeId,
      committeeName: commName,
      status: "تجهيز الفعاليات",
      location: seriesRooms.length > 0 ? seriesRooms.join("، ") : "حضوري",
      employees: [seriesAssignedEmployee].filter(Boolean),
      members: newMembers,
      notes: newNotes,
    }));
    // fix previously set wrong type
    newEventsList.forEach(e => e.type = "مفردة");`;

const replacement = `    const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx, // unique ID
      title: gen.title,
      type: "متسلسلة",
      date: gen.date,
      time: gen.time,
      committeeId: newCommitteeId,
      committeeName: commName,
      status: "تجهيز الفعاليات",
      location: seriesRooms.length > 0 ? seriesRooms.join("، ") : "حضوري",
      employees: [seriesAssignedEmployee].filter(Boolean),
      members: newMembers,
      notes: newNotes,
    }));`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/pages/Events.tsx', content);
    console.log("Patched type to متسلسلة in Events.tsx successfully!");
} else {
    console.log("Could not find the target block in Events.tsx.");
}
