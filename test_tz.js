process.env.TZ = "Asia/Riyadh";
const evt = { date: "2026-09-23", time: "13:30" };
const dt = new Date(evt.date + 'T' + evt.time + ':00');
console.log("Local time string:", dt.toString());
console.log("ISO string:", dt.toISOString());
