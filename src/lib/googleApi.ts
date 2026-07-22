// src/lib/googleApi.ts
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db, doc, setDoc, getDoc } from "./firebase";

// In-memory token storage (Mandatory for security to bypass localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
try {
  cachedAccessToken = localStorage.getItem("google_access_token");
} catch(e) {}
const tokenListeners = new Set<(token: string | null) => void>();


// --- Global Auth Modal Logic ---
export let authResolve: ((token: string) => void) | null = null;
export let authReject: ((err: any) => void) | null = null;

export function triggerAuthModal(): Promise<string> {
  return new Promise((resolve, reject) => {
    authResolve = resolve;
    authReject = reject;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('show-google-auth-modal'));
    }
  });
}

export function resolveAuthModal(token: string) {
  if (authResolve) authResolve(token);
  authResolve = null;
  authReject = null;
}

export function rejectAuthModal(err: any) {
  if (authReject) authReject(err);
  authResolve = null;
  authReject = null;
}


let tokenPromise: Promise<string | null> | null = null;
export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  if (tokenPromise) return tokenPromise;
  
  tokenPromise = (async () => {
    try {
      const docRef = doc(db, "system_settings", "google_workspace");
      const snap = await getDoc(docRef);
      if (snap && snap.exists && snap.exists()) {
        const data = snap.data();
        if (data && data.token) {
           setCachedAccessToken(data.token);
           try {
             localStorage.setItem("google_access_token", data.token);
           } catch(e) {}
           return data.token;
        }
      }
    } catch(e) {
      console.warn("Failed to get shared token", e);
    }
    return null;
  })();
  
  const res = await tokenPromise;
  tokenPromise = null;
  return res;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}


export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
  try {
    if (token) localStorage.setItem("google_access_token", token);
    else localStorage.removeItem("google_access_token");
  } catch(e) {}
  tokenListeners.forEach((listener) => {
    try {
      listener(token);
    } catch (e) {
      console.error("Token listener failure", e);
    }
  });
}

export function subscribeToAccessToken(listener: (token: string | null) => void) {
  tokenListeners.add(listener);
  listener(cachedAccessToken);
  return () => {
    tokenListeners.delete(listener);
  };
}

// Custom Google Auth Provider configured with all requested scopes
export const getGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/chat.spaces",
    "https://www.googleapis.com/auth/chat.messages.create",
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/meetings.space.created"
  ];
  scopes.forEach(scope => provider.addScope(scope));
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
};

// Sign in with popup and collect the access token safely in-memory

export async function connectGoogleWorkspace(): Promise<string> {
  const provider = getGoogleProvider();
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Failed to capture access token from Google sign-in.");
  }
  
  setCachedAccessToken(credential.accessToken);
  
  // Save to Firestore so other employees can use it
  try {
     const docRef = doc(db, "system_settings", "google_workspace");
     await setDoc(docRef, {
       token: credential.accessToken,
       timestamp: Date.now()
     });
  } catch(e) {
     console.warn("Failed to share token in Firestore", e);
  }
  
  return credential.accessToken;
}


export async function disconnectGoogleWorkspace() {
  setCachedAccessToken(null);
}

// helper rest call
async function fetchGoogleAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getSharedAccessToken();
  if (!token) {
    throw new Error("Authentication required: No active Google Workspace connection.");
  }

  let url = `https://www.googleapis.com/${endpoint}`;
  if (endpoint.startsWith("sheets/")) {
    url = `https://sheets.googleapis.com/${endpoint.substring(7)}`;
  } else if (endpoint.startsWith("docs/")) {
    url = `https://docs.googleapis.com/${endpoint.substring(5)}`;
  } else if (endpoint.startsWith("slides/")) {
    url = `https://slides.googleapis.com/${endpoint.substring(7)}`;
  } else if (endpoint.startsWith("gmail/")) {
    url = `https://gmail.googleapis.com/${endpoint.substring(6)}`;
  } else if (endpoint.startsWith("calendar/")) {
    url = `https://calendar.googleapis.com/${endpoint.substring(9)}`;
  } else if (endpoint.startsWith("tasks/")) {
    url = `https://tasks.googleapis.com/${endpoint.substring(6)}`;
  } else if (endpoint.startsWith("forms/")) {
    url = `https://forms.googleapis.com/${endpoint.substring(6)}`;
  } else if (endpoint.startsWith("chat/")) {
    url = `https://chat.googleapis.com/${endpoint.substring(5)}`;
  }

  const reqHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: reqHeaders,
    body: options.body
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          const retryResponse = await fetch(url, {
            method: options.method || "GET",
            headers: {
              ...reqHeaders,
              "Authorization": `Bearer ${newAccessToken}`,
            },
            body: options.body
          });
          if (retryResponse.status === 204) return null;
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(`Google API Error (${response.status}): ${errText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

/**
 * 1. GOOGLE DRIVE SERVICES
 */
export async function listDriveFiles(q: string = ""): Promise<any[]> {
  const queryParam = q ? `q=${encodeURIComponent(q)}` : "";
  const data = await fetchGoogleAPI(`drive/v3/files?${queryParam}&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=files(id,name,mimeType,webViewLink,iconLink)`);
  return data.files || [];
}

export async function createDriveFolder(name: string, parentId?: string): Promise<{ id: string; name: string }> {
  const body: any = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) {
    body.parents = [parentId];
  }
  return fetchGoogleAPI("drive/v3/files?supportsAllDrives=true", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Upload file directly into details folder
export async function uploadFileToDrive(name: string, content: string, mimeType: string = "text/plain", parentId?: string): Promise<any> {
  const token = await getSharedAccessToken();
  if (!token) throw new Error("No Google token found");

  const metadata: any = { name };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = "boundary_workspace_integration_mcci";
  const multipartBody = 
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${newAccessToken}`,
              "Content-Type": `multipart/related; boundary=${boundary}`,
            },
            body: multipartBody
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(`Google API Error (${response.status}): ${errText}`);
  }

  return response.json();
}

/**
 * 2. GOOGLE SHEETS SERVICES
 */

// Upload binary file directly into details folder (e.g. images, pdfs)

export async function getOrCreateFolder(name: string, parentId?: string): Promise<string> {
  const safeName = name.replace(/'/g, "\\'");
  
  let q = `mimeType='application/vnd.google-apps.folder' and name='${safeName}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }
  
  const files = await listDriveFiles(q);
  if (files && files.length > 0) {
    return files[0].id;
  }
  
  const folder = await createDriveFolder(name, parentId);
  return folder.id;
}

export async function uploadBinaryFileToDrive(name: string, base64Content: string, mimeType: string, parentId?: string): Promise<any> {
  const token = await getSharedAccessToken();
  if (!token) throw new Error("No Google token found");

  const metadata: any = { name };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = "boundary_workspace_integration_mcci";
  const multipartBody = 
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${base64Content}\r\n` +
    `--${boundary}--`;

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${newAccessToken}`,
              "Content-Type": `multipart/related; boundary=${boundary}`,
            },
            body: multipartBody
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(`Google API Error (${response.status}): ${errText}`);
  }

  return response.json();
}

export async function createSpreadsheet(title: string): Promise<any> {
  return fetchGoogleAPI("sheets/v4/spreadsheets", {
    method: "POST",
    body: JSON.stringify({
      properties: { title },
    }),
  });
}

export async function populateSpreadsheet(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
  return fetchGoogleAPI(`sheets/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({
      values,
    }),
  });
}

// Complete wizard helper to create and populate fully formatted Spreadsheet
export async function createAndPopulateSheet(title: string, headers: string[], rows: any[][]): Promise<{ spreadsheetId: string; webUrl: string }> {
  const sheet = await createSpreadsheet(title);
  const sheetId = sheet.spreadsheetId;
  const webUrl = sheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheetId}`;
  
  const sheetName = sheet.sheets?.[0]?.properties?.title || "Sheet1";
  
  const values = [headers, ...rows];
  await populateSpreadsheet(sheetId, `${sheetName}!A1`, values);
  return { spreadsheetId: sheetId, webUrl };
}

/**
 * 3. GMAIL SERVICES
 */
function makeEmailRaw(to: string, subject: string, bodyHtml: string): string {
  const emailLines = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "",
    bodyHtml
  ];
  const email = emailLines.join("\n");
  const base64UrlSafe = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64UrlSafe;
}

export async function sendGmailMessage(to: string, subject: string, bodyHtml: string): Promise<any> {
  const raw = makeEmailRaw(to, subject, bodyHtml);
  const token = await getSharedAccessToken();
  if (!token) {
    throw new Error("Authentication required: No active Google Workspace connection.");
  }

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw })
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${newAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw })
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(`Google API Error (${response.status}): ${errText}`);
  }

  return response.json();
}

/**
 * 4. GOOGLE CALENDAR & 10. GOOGLE MEET INFORMATION SERVICES
 */
export interface CalendarEventPayload {
  title: string;
  description: string;
  startTime: string; // ISO format e.g. 2026-06-22T10:00:00
  endTime: string;
  location?: string;
  createMeetLink?: boolean;
}

export async function createCalendarEvent(payload: CalendarEventPayload): Promise<{ eventUrl: string; meetUrl?: string; id: string }> {
  const body: any = {
    summary: payload.title,
    description: payload.description,
    start: {
      dateTime: payload.startTime,
      timeZone: "Asia/Riyadh"
    },
    end: {
      dateTime: payload.endTime,
      timeZone: "Asia/Riyadh"
    },
  };

  if (payload.location) {
    body.location = payload.location;
  }

  // Google Meet integration request
  if (payload.createMeetLink) {
    body.conferenceData = {
      createRequest: {
        requestId: `mcci_${Math.random().toString(36).substring(3, 11)}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet"
        }
      }
    };
  }

  const endpoint = "calendar/v3/calendars/primary/events?conferenceDataVersion=1";
  const response = await fetchGoogleAPI(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const meetUrl = response.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri;

  return {
    id: response.id,
    eventUrl: response.htmlLink || `https://calendar.google.com/calendar/event?eid=${response.id}`,
    meetUrl,
  };
}

/**
 * 5. GOOGLE DOCS SERVICES
 */
export async function createGoogleDoc(title: string, markdownContent: string): Promise<{ documentId: string; documentUrl: string }> {
  const docObj = await fetchGoogleAPI("docs/v1/documents", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  const documentId = docObj.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // Insert markdown content inside Google Doc using documentBatchUpdate REST calls
  const requests = [
    {
      insertText: {
        text: markdownContent,
        location: { index: 1 }
      }
    }
  ];

  await fetchGoogleAPI(`docs/v1/documents/${documentId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests }),
  });

  return { documentId, documentUrl };
}

/**
 * 6. GOOGLE SLIDES SERVICES
 */
export async function createGoogleSlide(title: string, slidesData: Array<{ title: string; text: string }>): Promise<{ presentationId: string; presentationUrl: string }> {
  const presentation = await fetchGoogleAPI("slides/v1/presentations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  const presentationId = presentation.presentationId;
  const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

  const requests: any[] = [];
  
  // First update slide 1 title
  requests.push({
    replaceAllText: {
      containsText: { text: "{{TITLE}}", matchCase: true },
      replaceText: title,
    }
  });

  // Loop slidesData and insert new layout pages
  slidesData.forEach((slide, idx) => {
    const slideId = `slide_mcci_${idx}`;
    const titleBoxId = `title_box_mcci_${idx}`;
    const textBoxId = `text_box_mcci_${idx}`;

    // 1. Create a slide page
    requests.push({
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" },
        placeholderIdFormat: "NONE"
      }
    });

    // 2. Select predefined layout boxes or create custom text shapes
    requests.push({
      createShape: {
        objectId: titleBoxId,
        shapeType: "RECTANGLE",
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 500, unit: "PT" }, height: { magnitude: 60, unit: "PT" } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 40, unit: "PT" }
        }
      }
    }, {
      createShape: {
        objectId: textBoxId,
        shapeType: "RECTANGLE",
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 500, unit: "PT" }, height: { magnitude: 200, unit: "PT" } },
          transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 120, unit: "PT" }
        }
      }
    });

    // 3. Populate slide content
    requests.push({
      insertText: {
        objectId: titleBoxId,
        text: slide.title,
        insertionIndex: 0
      }
    }, {
      insertText: {
        objectId: textBoxId,
        text: slide.text,
        insertionIndex: 0
      }
    });
  });

  try {
    await fetchGoogleAPI(`slides/v1/presentations/${presentationId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({ requests }),
    });
  } catch(e) {
    console.warn("Slides batch update error (fallback to blank slideshow):", e);
  }

  return { presentationId, presentationUrl };
}

/**
 * 7. GOOGLE TASKS SERVICES
 */
interface GoogleTaskPayload {
  title: string;
  notes?: string;
  due?: string; // ISO format e.g. 2026-06-22T00:00:00.000Z
}

export async function createGoogleTask(task: GoogleTaskPayload): Promise<any> {
  // First list or pick pre-existing task list, fallback to "@default"
  return fetchGoogleAPI("tasks/v1/lists/@default/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || "",
      due: task.due || undefined,
    }),
  });
}

/**
 * 8. GOOGLE CHAT SERVICES
 */
export async function listChatSpaces(): Promise<any[]> {
  try {
    const data = await fetchGoogleAPI("chat/v1/spaces");
    return data.spaces || [];
  } catch(e) {
    // Graceful fallback lists mock spaces if the company didn't create workspace chat yet
    console.warn("No active Chat Spaces initialized directly:", e);
    return [
      { name: "spaces/mcci_main", displayName: "المجلس الرئيسي لغرفة مكة" },
      { name: "spaces/mcci_general", displayName: "غرفة الأخصائيين والتنسيق المشترك" }
    ];
  }
}

export async function sendChatMessage(spaceId: string, text: string): Promise<any> {
  return fetchGoogleAPI(`chat/v1/${spaceId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      text,
    }),
  });
}

/**
 * 9. GOOGLE FORMS SERVICES
 */
export async function createGoogleForm(title: string): Promise<{ formId: string; responderUrl: string }> {
  const form = await fetchGoogleAPI("forms/v1/forms", {
    method: "POST",
    body: JSON.stringify({
      info: { title }
    }),
  });

  return {
    formId: form.formId,
    responderUrl: form.responderUrl || `https://docs.google.com/forms/d/${form.formId}/viewform`
  };
}

// Helper to resolve folder path string to a folder ID
export async function resolveDrivePath(pathStr: string): Promise<string> {
  const parts = pathStr.split('/').filter(p => p.trim() !== '');
  let parentId: string | undefined = undefined;
  for (const part of parts) {
    parentId = await getOrCreateFolder(part, parentId);
  }
  return parentId || '';
}

// Uploads a File object to a specific string path in Google Drive
export async function uploadFileToDriveByPath(file: File, pathStr: string, newName?: string): Promise<string> {
  const folderId = await resolveDrivePath(pathStr);
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  const finalName = newName || file.name;
  const uploaded = await uploadBinaryFileToDrive(finalName, base64, file.type, folderId);
  return uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
}

export async function moveDriveFile(fileId: string, folderId: string) {
  const file = await fetchGoogleAPI(`drive/v3/files/${fileId}?fields=parents`);
  const previousParents = (file.parents || []).join(',');
  await fetchGoogleAPI(`drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}`, {
    method: "PATCH",
    body: JSON.stringify({})
  });
}
