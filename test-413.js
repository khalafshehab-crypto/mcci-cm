const express = require('express');
const app = express();
app.use(express.json({ limit: "1kb" }));
app.post("/test", (req, res) => res.json({ok: 1}));
app.listen(3002, () => console.log('started'));
