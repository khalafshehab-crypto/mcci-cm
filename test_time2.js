const evt = { date: "2026-08-10", time: "10:00 AM" };
const dt = new Date(`${evt.date}T${evt.time || "00:00"}`);
console.log(dt.getTime(), isNaN(dt.getTime()));
