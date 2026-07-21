
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const { text } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fullPrompt = `أنت خبير في صياغة التوصيات الإدارية والمحاضر الرسمية باللغة العربية للجان القطاعية.
قم بإعادة صياغة النص التالي ليكون توصية رسمية احترافية، دقيقة، وواضحة.
حافظ على المعنى الأصلي، ولكن اجعله بصيغة رسمية معتمدة في القطاع الحكومي والخاص (مثل: "نوصي بـ..."، "العمل على..."، "التأكيد على...").
أعد النص فقط بدون أي مقدمات أو شروحات إضافية.
النص الأصلي:
${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
    });
    return res.status(200).json({ result: response.text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
