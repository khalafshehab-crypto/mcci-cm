const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = ['gemini-3.1-flash', 'gemini-3.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: 'hello'
      });
      console.log(model + ' SUCCESS');
    } catch (e) {
      console.log(model + ' ERROR: ' + e.message);
    }
  }
}
run();
