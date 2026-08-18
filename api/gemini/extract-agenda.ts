import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: false,
  },
};

export const maxDuration = 60;


async function uploadBase64ToGemini(ai: GoogleGenAI, base64Data: string, mimeType: string) {
    const tmpPath = path.join(os.tmpdir(), 'gemini_upload_' + Date.now() + '.pdf');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(tmpPath, buffer);
    const upload = await ai.files.upload({ file: tmpPath, config: { mimeType } });
    fs.unlinkSync(tmpPath);
    return upload.uri;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });

  try {
    let { prompt, fileBase64, mimeType, fileId, accessToken } = req.body;
    let uploadedFileUri = null;
    let uploadedFileMime = null;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    if (fileId && accessToken && !fileBase64) {
      try {
        const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (metaRes.ok) {
            const meta = await metaRes.json();
            mimeType = meta.mimeType;
            let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            let ext = ".pdf";
            
            if (mimeType === 'application/vnd.google-apps.document') {
                downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
                mimeType = 'application/pdf';
            } else if (mimeType === 'application/vnd.google-apps.presentation') {
                downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
                mimeType = 'application/pdf';
            } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
                downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
                mimeType = 'text/csv';
                ext = ".csv";
            }
            
            const fileRes = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (fileRes.ok) {
                const tmpPath = path.join(os.tmpdir(), 'gemini_upload_' + Date.now() + ext);
                const arrayBuffer = await fileRes.arrayBuffer();
                fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer));
                
                const upload = await ai.files.upload({ file: tmpPath, config: { mimeType: mimeType } });
                uploadedFileUri = upload.uri;
                uploadedFileMime = mimeType;
                
                fs.unlinkSync(tmpPath);
            }
        }
      } catch (e) {
          console.error("Drive fetch error in extract-agenda:", e);
      }
    } else if (fileBase64 && mimeType) {
        uploadedFileUri = await uploadBase64ToGemini(ai, fileBase64, mimeType);
        uploadedFileMime = mimeType;
    }

    let contents: any[] = [{ text: prompt }];
    if (uploadedFileUri) {
        contents = [
            { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime } },
            { text: prompt }
        ];
    }

    let retries = 3;
    let response;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: contents }],
        });
        break;
      } catch(err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/extract-agenda:", error);
    res.status(500).json({ error: error.message || "Failed to extract agenda" });
  }
}
