const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const models = await ai.models.list();
    const names = [];
    for await (const m of models) {
       names.push(m.name);
    }
    console.log(names);
  } catch(e) {
    console.error(e);
  }
}
run();
