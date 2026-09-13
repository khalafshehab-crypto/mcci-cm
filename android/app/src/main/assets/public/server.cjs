var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_os = __toESM(require("os"), 1);
var fs = __toESM(require("fs"), 1);
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
app.use((0, import_cors.default)({ origin: true }));
var server_default = app;
async function uploadBase64ToGemini(ai, fileBase64, mimeType) {
  let base64Data = fileBase64;
  if (base64Data.includes("base64,")) {
    base64Data = base64Data.split("base64,")[1];
  }
  const ext = mimeType === "application/pdf" ? ".pdf" : ".tmp";
  const tmpPath = import_path.default.join(import_os.default.tmpdir(), "gemini_upload_" + Date.now() + Math.floor(Math.random() * 1e3) + ext);
  fs.writeFileSync(tmpPath, Buffer.from(base64Data, "base64"));
  const upload = await ai.files.upload({ file: tmpPath, config: { mimeType } });
  fs.unlinkSync(tmpPath);
  return upload.uri;
}
var executeWithFallback = async (operationBuilder, maxRetries = 2) => {
  const modelsToTry = [
    "gemini-3.7-pro",
    "gemini-3.1-pro-preview",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash"
  ];
  let lastError = null;
  for (const modelName of modelsToTry) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[Gemini API] Trying model: ${modelName} (Attempt ${i + 1}/${maxRetries})`);
        return await operationBuilder(modelName);
      } catch (err) {
        lastError = err;
        const errStr = String(err?.message || err);
        const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand") || errStr.includes("overloaded");
        const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
        console.warn(`[Gemini API] Error on model ${modelName}: ${errStr}`);
        if (is429 && errStr.includes("limit: 0")) {
          console.warn(`[Gemini API] Quota is strictly 0 for model ${modelName}, immediately falling back to next model.`);
          break;
        }
        if ((is503 || is429) && i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1e3 + Math.random() * 1e3;
          console.warn(`[Gemini API] busy (${is503 ? "503" : "429"}) on ${modelName}, retrying in ${Math.round(delay)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
  }
  const finalErrorMsg = String(lastError?.message || lastError);
  if (finalErrorMsg.includes("429") || finalErrorMsg.includes("quota") || finalErrorMsg.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("\u062C\u0645\u064A\u0639 \u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0633\u062A\u0646\u0641\u062F\u062A \u0627\u0644\u062D\u0635\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u0644\u0645\u0641\u062A\u0627\u062D\u0643. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0642\u0644\u064A\u0644\u0627\u064B \u0623\u0648 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0644\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0629.");
  }
  throw lastError || new Error("\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u0639\u062F \u0639\u062F\u0629 \u0645\u062D\u0627\u0648\u0644\u0627\u062A.");
};
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.post("/api/log-client-error", (req, res) => {
  fs.appendFileSync("client_errors.log", JSON.stringify(req.body) + "\n");
  res.json({ ok: true });
});
app.post("/api/gmail-send", async (req, res) => {
  try {
    const { token, raw } = req.body;
    if (!token) {
      return res.status(400).json({ error: { message: "Access token is required" } });
    }
    if (!raw) {
      return res.status(400).json({ error: { message: "Raw message content is required" } });
    }
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw })
    });
    const responseData = await response.text();
    if (!response.ok) {
      console.error("[Google Proxy] Error:", response.status, responseData);
      require("fs").appendFileSync("proxy_errors.log", (/* @__PURE__ */ new Date()).toISOString() + " " + response.status + " " + responseData + "\n");
      return res.status(response.status).json({ error: { message: responseData } });
    }
    let parsed = {};
    try {
      parsed = JSON.parse(responseData);
    } catch (e) {
      parsed = { rawData: responseData };
    }
    return res.json(parsed);
  } catch (err) {
    console.error("Gmail Proxy Error:", err);
    return res.status(500).json({ error: { message: err.message || "Internal Server Error" } });
  }
});
app.post("/api/google-proxy", async (req, res) => {
  try {
    const { token, url, method, body, headers } = req.body;
    if (!token) {
      return res.status(400).json({ error: { message: "Access token is required" } });
    }
    if (!url) {
      return res.status(400).json({ error: { message: "URL is required" } });
    }
    const reqHeaders = {
      "Authorization": `Bearer ${token}`,
      ...headers
    };
    const fetchOptions = {
      method: method || "GET",
      headers: reqHeaders
    };
    if (body) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    console.log(`[Google Proxy] Forwarding ${method || "GET"} request to ${url}`);
    const response = await fetch(url, fetchOptions);
    if (response.status === 204) {
      return res.status(204).end();
    }
    const responseData = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({ error: { message: responseData } });
    }
    let parsed = {};
    try {
      parsed = JSON.parse(responseData);
    } catch (e) {
      parsed = { rawData: responseData };
    }
    return res.json(parsed);
  } catch (err) {
    console.error("Google Proxy Error:", err);
    return res.status(500).json({ error: { message: err.message || "Internal Server Error" } });
  }
});
app.post("/api/gemini/generate-new-letter", async (req, res) => {
  try {
    const { mode, prompt, replyFileBase64, replyFileMimeType, committeeName, recipientName, recipientPosition, subject, details, contact, attachments, signatory, workspaceService } = req.body;
    if (!req.body.userApiKey) {
      return res.status(403).json({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0645\u0641\u062A\u0627\u062D (BYOK) \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0634\u062E\u0635\u064A' \u0636\u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646." });
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: req.body.userApiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });
    const userParts = [];
    if (replyFileBase64 && typeof replyFileBase64 === "string" && replyFileMimeType) {
      try {
        const uri = await uploadBase64ToGemini(ai, replyFileBase64, replyFileMimeType);
        userParts.push({ fileData: { fileUri: uri, mimeType: replyFileMimeType } });
      } catch (uploadErr) {
        console.error("Upload to Gemini File API failed, falling back to inlineData", uploadErr);
        userParts.push({
          inlineData: {
            data: replyFileBase64,
            mimeType: replyFileMimeType
          }
        });
      }
    }
    let finalPrompt = prompt;
    if (!finalPrompt) {
      if (workspaceService === "docs" || workspaceService === "gmail" || !workspaceService) {
        finalPrompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0635\u064A\u0627\u063A\u0629 \u062E\u0637\u0627\u0628\u0627\u062A \u0631\u0633\u0645\u064A\u0629 \u0633\u0639\u0648\u062F\u064A\u0629 \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 (\u063A\u0631\u0641\u0629 \u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629).
\u064A\u0631\u062C\u0649 \u0635\u064A\u0627\u063A\u0629 \u062E\u0637\u0627\u0628 \u0631\u0633\u0645\u064A \u0627\u062D\u062A\u0631\u0627\u0641\u064A \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629:
\u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647 (\u0627\u0633\u0645\u0647 \u0623\u0648 \u0635\u0641\u062A\u0647): ${recipientName || "\u0627\u0644\u0645\u0643\u0631\u0645"}
\u0645\u0646\u0635\u0628\u0647: ${recipientPosition || ""}
\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u062E\u0637\u0627\u0628: ${subject || "\u062E\u0637\u0627\u0628 \u0631\u0633\u0645\u064A"}
\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0648\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0641\u064A \u0627\u0644\u062E\u0637\u0627\u0628: ${details}
\u0644\u062C\u0646\u0629: ${committeeName || "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0644\u062C\u0627\u0646"}
\u062C\u0647\u0629 \u0627\u0644\u062A\u0648\u0642\u064A\u0639: ${signatory || ""}
\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 (\u0625\u0646 \u0648\u062C\u062F\u062A): ${contact || ""}
\u0627\u0644\u0645\u0631\u0641\u0642\u0627\u062A (\u0625\u0646 \u0648\u062C\u062F\u062A): ${attachments || ""}

\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0627\u0644\u062E\u0637\u0627\u0628 \u0628\u0646\u0641\u0633 \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0648\u0627\u0644\u0647\u064A\u0643\u0644\u0629 \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0644\u0644\u062E\u0637\u0627\u0628\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629\u060C \u0645\u0639 \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0644\u062A\u0646\u0627\u0633\u0628 \u0627\u0644\u0645\u0639\u0637\u064A\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0623\u0639\u0644\u0627\u0647:

\u0633\u0639\u0627\u062F\u0629 / [\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647]                                                            \u0633\u0644\u0645\u0647 \u0627\u0644\u0644\u0647
[\u0627\u0644\u0645\u0646\u0635\u0628]

\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647..

\u062A\u0647\u062F\u064A\u0643\u0645 \u063A\u0631\u0641\u0629 \u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629 \u0623\u0637\u064A\u0628 \u062A\u062D\u064A\u0629 .. [\u0645\u0642\u062F\u0645\u0629 \u0627\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u062E\u0637\u0627\u0628]

[\u0646\u0635 \u0627\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A \u064A\u0639\u0628\u0631 \u0628\u0648\u0636\u0648\u062D \u0639\u0646 \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0630\u0643\u0648\u0631\u0629 \u0641\u064A "\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0648\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" \u0628\u0623\u0633\u0644\u0648\u0628 \u0625\u062F\u0627\u0631\u064A \u0631\u0635\u064A\u0646 \u0648\u0645\u062D\u0643\u0645]

\u0633\u0627\u0626\u0644\u064A\u0646 \u0627\u0644\u0644\u0647 \u0639\u0632 \u0648\u062C\u0644 \u0644\u0633\u0639\u0627\u062F\u062A\u0643\u0645 \u062F\u0648\u0627\u0645 \u0627\u0644\u062A\u0648\u0641\u064A\u0642 \u0648\u0627\u0644\u0633\u062F\u0627\u062F\u060C \u0648\u0644\u063A\u0631\u0641\u062A\u0646\u0627 \u0627\u0644\u0645\u0648\u0642\u0631\u0629 \u0627\u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u062A\u0642\u062F\u0645 \u0648\u0627\u0644\u0627\u0632\u062F\u0647\u0627\u0631.

[\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0646\u0627\u0643 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u062A\u0648\u0627\u0635\u0644 \u0623\u0636\u0641 \u0641\u0642\u0631\u0629 \u0627\u0644\u062A\u0648\u0627\u0635\u0644: \u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u0625\u064A\u0639\u0627\u0632 \u0644\u0645\u0646 \u064A\u0644\u0632\u0645 \u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639...]

\u0648\u062A\u0641\u0636\u0644\u0648\u0627 \u0628\u0642\u0628\u0648\u0644 \u062E\u0627\u0644\u0635 \u0627\u0644\u062A\u062D\u064A\u0629 \u0648\u0627\u0644\u062A\u0642\u062F\u064A\u0631\u060C\u060C\u060C

[\u062C\u0647\u0629 \u0627\u0644\u062A\u0648\u0642\u064A\u0639 \u0623\u0648 \u0627\u0644\u0645\u0646\u0635\u0628]
[\u0627\u0644\u0627\u0633\u0645 \u0625\u0630\u0627 \u062A\u0648\u0641\u0631]

\u0645\u0644\u0627\u062D\u0638\u0629 \u0647\u0627\u0645\u0629: \u0623\u062E\u0631\u062C \u0627\u0644\u062E\u0637\u0627\u0628 \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0623\u064A \u0634\u0631\u0648\u062D\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0648\u0628\u062F\u0648\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0639\u0644\u0627\u0645\u0627\u062A Markdown \u0645\u062B\u0644 ''' \u060C \u0648\u062A\u0623\u0643\u062F \u0645\u0646 \u0645\u062D\u0627\u0643\u0627\u0629 \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0628\u062F\u0642\u0629\u060C \u0641\u0642\u0637 \u0627\u0644\u0646\u0635 \u0627\u0644\u062C\u0627\u0647\u0632 \u0627\u0644\u0635\u0627\u0641\u064A \u0644\u0644\u062E\u0637\u0627\u0628.`;
      } else {
        finalPrompt = `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0648\u0645\u062D\u062A\u0631\u0641. \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0625\u0646\u0634\u0627\u0621 \u0645\u062D\u062A\u0648\u0649 \u0627\u062D\u062A\u0631\u0627\u0641\u064A (\u0646\u0648\u0639 ${workspaceService}) \u0644\u0644\u0645\u0648\u0636\u0648\u0639: ${subject}. \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644: ${details}. \u0627\u0644\u062C\u0647\u0629: ${committeeName}.`;
      }
    }
    userParts.push({ text: finalPrompt });
    const response = await executeWithFallback((modelName) => ai.models.generateContent({
      model: modelName,
      // use pro since it could be reading a pdf/image reply
      contents: { parts: userParts }
    }));
    return res.json({ result: response.text });
  } catch (err) {
    console.error("Gemini Generate New Letter Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});
app.post("/api/gemini/generate-letter", async (req, res) => {
  try {
    const { prompt, templateContent } = req.body;
    if (!prompt || !templateContent) {
      return res.status(400).json({ error: "Missing prompt or templateContent" });
    }
    if (!req.body.userApiKey) {
      return res.status(403).json({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0645\u0641\u062A\u0627\u062D (BYOK) \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0634\u062E\u0635\u064A' \u0636\u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646." });
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: req.body.userApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const fullPrompt = `
You are an expert Arabic official letter writer.
You have been given a template for an official letter. The user will provide instructions on how to fill in the variables.
Maintain the exact structure, formatting, and formal tone of the template.
Only change the specific fields (like names, dates, subject, etc.) as requested by the user.

Template:
${templateContent}

User Instructions:
${prompt}

Output ONLY the final Arabic text of the letter, ready to be printed or used. Do not include markdown blocks or any other commentary.
`;
    const response = await executeWithFallback((modelName) => ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: fullPrompt }] }
    }));
    return res.json({ result: response.text });
  } catch (err) {
    console.error("Gemini Generate Letter Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});
app.post("/api/gemini/extract-agenda", async (req, res) => {
  try {
    let { prompt, fileBase64, mimeType, fileId, accessToken } = req.body;
    let uploadedFileUri = null;
    let uploadedFileMime = null;
    const ai = new import_genai.GoogleGenAI({
      apiKey: req.body.userApiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
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
          if (mimeType === "application/vnd.google-apps.document") {
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
            mimeType = "application/pdf";
          } else if (mimeType === "application/vnd.google-apps.presentation") {
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
            mimeType = "application/pdf";
          } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
            mimeType = "text/csv";
            ext = ".csv";
          }
          const fileRes = await fetch(downloadUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (fileRes.ok) {
            const tmpPath = import_path.default.join(import_os.default.tmpdir(), "gemini_upload_" + Date.now() + ext);
            const arrayBuffer = await fileRes.arrayBuffer();
            fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer));
            const upload = await ai.files.upload({ file: tmpPath, config: { mimeType } });
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
    if (!req.body.userApiKey) {
      return res.status(403).json({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0645\u0641\u062A\u0627\u062D (BYOK) \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0634\u062E\u0635\u064A' \u0636\u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646." });
    }
    let contents = [{ text: prompt }];
    if (uploadedFileUri) {
      contents = [
        { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime } },
        { text: prompt }
      ];
    }
    const response = await executeWithFallback((modelName) => ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: contents }]
    }));
    res.json({ result: response.text });
  } catch (error) {
    console.error("Error in /api/gemini/extract-agenda:", error);
    res.status(500).json({ error: "Failed to extract agenda", details: error instanceof Error ? error.message : String(error) });
  }
});
app.post("/api/gemini/reply-to-letter", async (req, res) => {
  try {
    const { incomingLetter, fileBase64, mimeType } = req.body;
    if (!incomingLetter && !fileBase64) {
      return res.status(400).json({ error: "Missing incomingLetter text or file" });
    }
    if (!req.body.userApiKey) {
      return res.status(403).json({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0645\u0641\u062A\u0627\u062D (BYOK) \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0634\u062E\u0635\u064A' \u0636\u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646." });
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: req.body.userApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const fullPrompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062E\u0637\u0627\u0628\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 (\u0648\u062A\u062D\u062F\u064A\u062F\u0627\u064B \u063A\u0631\u0641\u0629 \u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629).
\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u062A\u0627\u0644\u064A:
---
${incomingLetter || "\u0645\u0631\u0641\u0642 \u0641\u064A \u0627\u0644\u0645\u0644\u0641"}
---
\u0627\u0644\u0645\u0637\u0644\u0648\u0628:
\u0625\u0639\u062F\u0627\u062F \u0642\u0627\u0644\u0628 \u062E\u0637\u0627\u0628 \u0631\u062F \u0631\u0633\u0645\u064A \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062E\u0637\u0627\u0628 \u0627\u0644\u0648\u0627\u0631\u062F (\u0633\u0648\u0627\u0621 \u0643\u0646\u0635 \u0623\u0648 \u0643\u0645\u0644\u0641 \u0645\u0631\u0641\u0642).
\u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0627\u0644\u0642\u0627\u0644\u0628 \u0639\u0644\u0649 \u0645\u062A\u063A\u064A\u0631\u0627\u062A \u0645\u062D\u0627\u0637\u0629 \u0628\u0623\u0642\u0648\u0627\u0633 \u0645\u0631\u0628\u0639\u0629 \u0645\u062B\u0644 [\u0627\u0644\u0627\u0633\u0645]\u060C [\u0627\u0644\u062A\u0627\u0631\u064A\u062E]\u060C [\u0627\u0644\u0645\u0648\u0636\u0648\u0639] \u0644\u0643\u064A \u064A\u0642\u0648\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u062A\u0639\u0628\u0626\u062A\u0647\u0627 \u0644\u0627\u062D\u0642\u0627\u064B.
\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0627\u0644\u0631\u062F \u0645\u0635\u0627\u063A\u0627\u064B \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u062A\u0627\u0644\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0644\u062F\u064A\u0646\u0627:

\u0627\u0644\u0645\u0648\u0636\u0648\u0639: [\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u062E\u0637\u0627\u0628]

\u0633\u0639\u0627\u062F\u0629 [\u0644\u0642\u0628 \u0648\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647] \u0633\u0644\u0645\u0647 \u0627\u0644\u0644\u0647
[\u0645\u0646\u0635\u0628 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647\u0627]
\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647\u060C \u0648\u0628\u0639\u062F:

\u062A\u0647\u062F\u064A\u0643\u0645 \u063A\u0631\u0641\u0629 \u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629 \u0623\u0637\u064A\u0628 \u062A\u062D\u064A\u0629\u060C [\u062B\u0645 \u062A\u0643\u0645\u0644\u0629 \u0627\u0644\u062F\u064A\u0628\u0627\u062C\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629] ...

[\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0631\u062F \u0645\u0642\u0633\u0645 \u0644\u0641\u0642\u0631\u0627\u062A \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u0631\u062A\u0628\u0629]

\u0634\u0627\u0643\u0631\u064A\u0646 \u0648\u0645\u0642\u062F\u0631\u064A\u0646 \u062F\u0639\u0645 \u0648\u0627\u0647\u062A\u0645\u0627\u0645 \u0633\u0639\u0627\u062F\u062A\u0643\u0645\u060C

\u0623\u0645\u064A\u0646 \u0639\u0627\u0645 \u063A\u0631\u0641\u0629 \u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629
\u062F. \u062B\u0627\u0645\u0631 \u0628\u0646 \u0623\u062D\u0645\u062F \u0628\u0627\u0639\u0638\u064A\u0645

\u0623\u0639\u062F \u0646\u0635 \u0642\u0627\u0644\u0628 \u0627\u0644\u062E\u0637\u0627\u0628 \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0623\u064A \u0634\u0631\u0648\u062D\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0648\u0628\u062F\u0648\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 markdown (\u0641\u0642\u0637 \u0627\u0644\u0646\u0635).`;
    let contents = [{ text: fullPrompt }];
    if (fileBase64 && mimeType) {
      let uri = await uploadBase64ToGemini(ai, fileBase64, mimeType);
      contents = [
        { fileData: { fileUri: uri, mimeType } },
        { text: fullPrompt }
      ];
    }
    const response = await executeWithFallback((modelName) => ai.models.generateContent({
      model: modelName,
      contents: { parts: contents }
    }));
    return res.json({ result: response.text });
  } catch (err) {
    console.error("Gemini Reply to Letter Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});
app.post("/api/gemini/smart-recommendation", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }
    if (!req.body.userApiKey) {
      return res.status(403).json({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A. \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0645\u0641\u062A\u0627\u062D (BYOK) \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0634\u062E\u0635\u064A' \u0636\u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646." });
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: req.body.userApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const fullPrompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0636\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0644\u0644\u062C\u0627\u0646 \u0627\u0644\u0642\u0637\u0627\u0639\u064A\u0629.
\u0642\u0645 \u0628\u0625\u0639\u0627\u062F\u0629 \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u0646\u0635 \u0627\u0644\u062A\u0627\u0644\u064A \u0644\u064A\u0643\u0648\u0646 \u062A\u0648\u0635\u064A\u0629 \u0631\u0633\u0645\u064A\u0629 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629\u060C \u062F\u0642\u064A\u0642\u0629\u060C \u0648\u0648\u0627\u0636\u062D\u0629.
\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0646\u0649 \u0627\u0644\u0623\u0635\u0644\u064A\u060C \u0648\u0644\u0643\u0646 \u0627\u062C\u0639\u0644\u0647 \u0628\u0635\u064A\u063A\u0629 \u0631\u0633\u0645\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0641\u064A \u0627\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u062D\u0643\u0648\u0645\u064A \u0648\u0627\u0644\u062E\u0627\u0635 (\u0645\u062B\u0644: "\u0646\u0648\u0635\u064A \u0628\u0640..."\u060C "\u0627\u0644\u0639\u0645\u0644 \u0639\u0644\u0649..."\u060C "\u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0639\u0644\u0649...").
\u0623\u0639\u062F \u0627\u0644\u0646\u0635 \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0623\u064A \u0645\u0642\u062F\u0645\u0627\u062A \u0623\u0648 \u0634\u0631\u0648\u062D\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629.

\u0627\u0644\u0646\u0635 \u0627\u0644\u0623\u0635\u0644\u064A:
${text}`;
    const response = await executeWithFallback((modelName) => ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: fullPrompt }] }
    }));
    return res.json({ result: response.text });
  } catch (err) {
    console.error("Gemini Smart Recommendation Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});
app.get("/api/drive-file/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const token = req.query.token;
    if (!token) {
      return res.status(401).send("No token provided");
    }
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch from Drive");
    }
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error("Drive file fetch error:", error);
    res.status(500).send("Internal error");
  }
});
app.post("/api/fetch-public-sheet", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from URL" });
    }
    const buffer = await response.arrayBuffer();
    res.set("Content-Type", "application/octet-stream");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Fetch Public Sheet Error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/log", import_express.default.json(), (req, res) => {
  fs.appendFileSync("client_errors.log", JSON.stringify(req.body) + "\n");
  res.json({ ok: true });
});
app.get("/api/cron", (req, res) => {
  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).end("Unauthorized");
  }
  res.json({ ok: true });
});
var JOIN_REQUESTS_FILE = "join_requests.json";
function getJoinRequests() {
  try {
    if (fs.existsSync(JOIN_REQUESTS_FILE)) {
      return JSON.parse(fs.readFileSync(JOIN_REQUESTS_FILE, "utf8"));
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}
function saveJoinRequests(data) {
  try {
    fs.writeFileSync(JOIN_REQUESTS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
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
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  list.push(newItem);
  saveJoinRequests(list);
  res.json(newItem);
});
app.put("/api/join-requests/:id", (req, res) => {
  const list = getJoinRequests();
  const index = list.findIndex((x) => x.id === req.params.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...req.body };
    saveJoinRequests(list);
    res.json(list[index]);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});
app.delete("/api/join-requests/:id", (req, res) => {
  const list = getJoinRequests();
  const filtered = list.filter((x) => x.id !== req.params.id);
  saveJoinRequests(filtered);
  res.json({ success: true });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  import("vite").then(({ createServer }) => {
    createServer({
      server: { middlewareMode: true },
      appType: "spa"
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  });
} else if (process.env.VERCEL !== "1") {
  const distPath = import_path.default.join(process.cwd(), "dist");
  app.use(import_express.default.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(import_path.default.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
//# sourceMappingURL=server.cjs.map
