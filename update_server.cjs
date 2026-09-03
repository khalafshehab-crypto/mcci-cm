const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiCode = `
const JOIN_REQUESTS_FILE = 'join_requests.json';

function getJoinRequests() {
  try {
    if (fs.existsSync(JOIN_REQUESTS_FILE)) {
      return JSON.parse(fs.readFileSync(JOIN_REQUESTS_FILE, 'utf8'));
    }
  } catch(e) {
    console.error(e);
  }
  return [];
}

function saveJoinRequests(data) {
  try {
    fs.writeFileSync(JOIN_REQUESTS_FILE, JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}

app.get("/api/join-requests", (req, res) => {
  res.json(getJoinRequests());
});

app.post("/api/join-requests", (req, res) => {
  const list = getJoinRequests();
  const newItem = {
    ...req.body,
    id: "join_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString()
  };
  list.push(newItem);
  saveJoinRequests(list);
  res.json(newItem);
});

app.put("/api/join-requests/:id", (req, res) => {
  const list = getJoinRequests();
  const index = list.findIndex(x => x.id === req.params.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...req.body };
    saveJoinRequests(list);
    res.json(list[index]);
  } else {
    res.status(404).json({error: "Not found"});
  }
});

app.delete("/api/join-requests/:id", (req, res) => {
  const list = getJoinRequests();
  const filtered = list.filter(x => x.id !== req.params.id);
  saveJoinRequests(filtered);
  res.json({success: true});
});

`;

// Insert apiCode before app.get("/api/health")
code = code.replace('app.get("/api/health"', apiCode + '\n  app.get("/api/health"');

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts");
