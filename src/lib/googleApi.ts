// src/lib/googleApi.ts
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { auth, db, doc, setDoc, getDoc } from "./firebase";

// In-memory token storage (Mandatory for security to bypass localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
try {
  cachedAccessToken = localStorage.getItem("google_access_token");
} catch(e) {}
const tokenListeners = new Set<(token: string | null) => void>();


// --- Global Auth Modal Logic ---
let activeAuthPromise: Promise<string> | null = null;
export let authResolve: ((token: string) => void) | null = null;
export let authReject: ((err: any) => void) | null = null;

export function triggerAuthModal(): Promise<string> {
  if (activeAuthPromise) return activeAuthPromise;
  
  activeAuthPromise = new Promise((resolve, reject) => {
    authResolve = (token: string) => {
      activeAuthPromise = null;
      resolve(token);
    };
    authReject = (err: any) => {
      activeAuthPromise = null;
      reject(err);
    };
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('show-google-auth-modal'));
    }
  });
  return activeAuthPromise;
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
      if (auth.currentUser?.email) {
         try {
           const myRef = doc(db, "employee_tokens", auth.currentUser.email.toLowerCase());
           const mySnap = await getDoc(myRef);
           if (mySnap.exists()) {
             const data = mySnap.data();
             if (data && data.token) {
               setCachedAccessToken(data.token);
               return data.token;
             }
           }
         } catch(e) {}
      }
      
      // Fallback to local storage as a last resort for the current user
      const localToken = localStorage.getItem("google_access_token");
      if (localToken) {
        setCachedAccessToken(localToken);
        return localToken;
      }
      
    } catch(e) {
      console.warn("Failed to get personal token", e);
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
  
  // Try to update personal token
  try {
    if (result.user?.email) {
       const tokenRef = doc(db, "employee_tokens", result.user.email.toLowerCase());
       await setDoc(tokenRef, {
         token: credential.accessToken,
         timestamp: Date.now()
       }, { merge: true });
    }
  } catch(e) {
    console.warn("Failed to update personal token", e);
  }
  
  try {
    localStorage.setItem("google_access_token", credential.accessToken);
  } catch(e) {}
  
  return credential.accessToken;
}


export async function disconnectGoogleWorkspace() {
  setCachedAccessToken(null);
}

// helper rest call
async function fetchGoogleAPI(endpoint: string, options: RequestInit = {}, maxRetries = 5, customToken?: string): Promise<any> {
  const token = customToken || await getSharedAccessToken();
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
  } else if (endpoint.startsWith("forms/")) {
    url = `https://forms.googleapis.com/${endpoint.substring(6)}`;
  } else if (endpoint.startsWith("chat/")) {
    url = `https://chat.googleapis.com/${endpoint.substring(5)}`;
  } else if (endpoint.startsWith("gmail/")) {
    url = `https://gmail.googleapis.com/${endpoint}`;
  } else if (endpoint.startsWith("tasks/")) {
    url = `https://tasks.googleapis.com/${endpoint}`;
  }

  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "google-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        url,
        method: options.method || "GET",
        headers: { ...options.headers },
        body: options.body
      })
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 500 || response.status === 502 || response.status === 503) {
        console.warn(`Google API Rate Limit (${response.status}). Retrying attempt ${attempt + 1}/${maxRetries}...`);
        await new Promise(res => setTimeout(res, 2000 * Math.pow(2, attempt) + Math.random() * 1000));
        lastError = response;
        continue;
      }
      
      if (response.status === 403) {
         const cloned = response.clone();
         const errJson = await cloned.json().catch(() => ({}));
         if (errJson?.error?.message?.includes("Rate Limit") || errJson?.error?.message?.includes("rate limit") || errJson?.error?.errors?.[0]?.reason === "rateLimitExceeded" || errJson?.error?.errors?.[0]?.reason === "userRateLimitExceeded") {
            console.warn(`Google API Rate Limit (403). Retrying attempt ${attempt + 1}/${maxRetries}...`);
            await new Promise(res => setTimeout(res, 2000 * Math.pow(2, attempt) + Math.random() * 1000));
            lastError = response;
            continue;
         }
      }

      if (response.status === 401) {
        console.warn("Google API 401: Token expired. Requesting user to re-authenticate via UI...");
        try {
          const newAccessToken = await triggerAuthModal();
          if (newAccessToken) {
            setCachedAccessToken(newAccessToken);
            const retryResponse = await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "google-proxy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: newAccessToken,
                url,
                method: options.method || "GET",
                headers: { ...options.headers },
                body: options.body
              })
            });
            if (retryResponse.status === 204) return null;
            return retryResponse.json();
          }
        } catch (e) {
          console.error("User rejected re-auth", e);
          throw new Error("Google Workspace Session Expired. Please log in again.");
        }
      }
      
      const errObj = await response.json().catch(() => ({}));
      throw new Error(`Google API Error (${response.status}): ${errObj?.error?.message || response.statusText}`);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { return text; }
  }
  
  const errObj = await lastError.json().catch(() => ({}));
  throw new Error(`Google API Error (${lastError.status}): ${errObj?.error?.message || lastError.statusText}`);
}

export async function listDriveFiles(q: string = ""): Promise<any[]> {
  const endpoint = q ? `drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)` : "drive/v3/files";
  const data = await fetchGoogleAPI(endpoint);
  return data.files || [];
}

export async function createDriveFolder(name: string, parentId?: string): Promise<{ id: string; name: string }> {
  const metadata: any = {
    name,
    mimeType: "application/vnd.google-apps.folder"
  };
  if (parentId) {
    metadata.parents = [parentId];
  }
  const folder = await fetchGoogleAPI("drive/v3/files", {
    method: "POST",
    body: JSON.stringify(metadata),
  });
  return { id: folder.id, name: folder.name };
}

export async function uploadFileToDrive(name: string, content: string, mimeType: string = "text/plain", parentId?: string): Promise<any> {
  const base64Content = btoa(unescape(encodeURIComponent(content)));
  return uploadBinaryFileToDrive(name, base64Content, mimeType, parentId);
}

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


/**
 * 2. GOOGLE SHEETS SERVICES
 */

// Upload binary file directly into details folder (e.g. images, pdfs)



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
    const errObj = await response.json().catch(() => ({}));
    throw new Error(`Google API Error (${response.status}): ${errObj?.error?.message || response.statusText}`);
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
      values
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

  const response = await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "google-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw })
    })
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
          const retryResponse = await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "google-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: newAccessToken,
              url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ raw })
            })
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errObj = await response.json().catch(() => ({}));
    throw new Error(`Google API Error (${response.status}): ${errObj?.error?.message || response.statusText}`);
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




export async function updateGoogleTask(taskId: string, task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`tasks/v1/lists/@default/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({
      id: taskId,
      title: task.title,
      notes: task.notes || "",
      due: task.due || undefined
    }),
  }, 5);
}

export async function deleteGoogleTask(taskId: string, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`tasks/v1/lists/@default/tasks/${taskId}`, {
    method: "DELETE",
  }, 5);
}

export async function createGoogleTask(task: GoogleTaskPayload, employeeEmail?: string): Promise<any> {
  // First list or pick pre-existing task list, fallback to "@default"
  return fetchGoogleAPI("tasks/v1/lists/@default/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || "",
      due: task.due || undefined
    }),
  }, 5);
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
      text
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

export async function autoCreateEventDriveFolders(evt: any, recommendations: any[]) {
  try {
    let token = await getSharedAccessToken();
    if (!token) {
      token = await triggerAuthModal();
      if (!token) return null;
    }

    let eventTitle = evt.eventName || evt.title || "بدون عنوان";
    let eventKind = "فعاليات أخرى";
    if (eventTitle.includes("اجتماع")) eventKind = "الاجتماعات";
    else if (eventTitle.includes("لقاء")) eventKind = "اللقاءات";
    else if (eventTitle.includes("زيارة")) eventKind = "الزيارات";
    else if (eventTitle.includes("ورشة عمل")) eventKind = "ورش العمل";

    const baseParts = [
      "تقرير اللجان للدورة الـ 22",
      "اللجان المعتمدة",
      evt.committeeName || "عام",
      "الفعاليات",
      eventKind,
      eventTitle
    ];

    let currentFolderId = null;
    for (const part of baseParts) {
      if (!currentFolderId) {
         currentFolderId = await getOrCreateFolder(part);
      } else {
         currentFolderId = await getOrCreateFolder(part, currentFolderId);
      }
    }

    const eventFolderId = currentFolderId;

    if (recommendations && recommendations.length > 0) {
      const recommendationsFolderId = await getOrCreateFolder("التوصيات", eventFolderId);
      for (const rec of recommendations) {
        if (rec.title || rec.recommendation) {
           await getOrCreateFolder((rec.title || rec.recommendation), recommendationsFolderId);
        }
      }
    }

    return eventFolderId;
  } catch(err) {
    console.error("Failed to auto create event folders", err);
    return null;
  }
}


export async function downloadDriveFileBase64(fileIdOrUrl: string): Promise<{ base64: string, mimeType: string }> {
  let fileId = fileIdOrUrl;
  const match = fileIdOrUrl.match(/[-\w]{25,}/);
  if (match) fileId = match[0];
  
  const token = await getSharedAccessToken();
  if (!token) throw new Error("No Google token found");
  
  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!metaRes.ok) {
    const errText = await metaRes.text();
    console.error("Drive metadata fetch failed:", errText);
    
    // If the error is an HTML page (like the 404 from Vercel we saw), don't show the whole HTML
    let displayErr = errText;
    if (displayErr.includes('<html')) {
       displayErr = "File not found or permission denied on Google Drive.";
    } else {
       try {
           const parsed = JSON.parse(errText);
           if (parsed.error && parsed.error.message) {
               displayErr = parsed.error.message;
           }
       } catch(e) {}
    }
    throw new Error("Failed to fetch file metadata: " + displayErr);
  }
  const meta = await metaRes.json();
  const mimeType = meta.mimeType;
  
  let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  let finalMimeType = mimeType;
  
  if (mimeType.includes('application/vnd.google-apps.')) {
     if (mimeType === 'application/vnd.google-apps.spreadsheet') {
         downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
         finalMimeType = 'text/csv';
     } else if (mimeType === 'application/vnd.google-apps.presentation') {
         downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
         finalMimeType = 'application/pdf';
     } else if (mimeType === 'application/vnd.google-apps.document') {
         downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
         finalMimeType = 'application/pdf';
     } else {
         throw new Error("Cannot download this type of Google Workspace file: " + mimeType);
     }
  }
  
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error("Drive download failed:", errText);
    throw new Error("Failed to download file: " + errText);
  }
  const blob = await res.blob();
  
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });
  
  return { base64, mimeType: finalMimeType };
}


export interface GoogleCalendarEventPayload {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: { email: string }[];
}

export async function createGoogleCalendarEvent(event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI("calendar/v3/calendars/primary/events?sendUpdates=all", {
    method: "POST",
    body: JSON.stringify({
      summary: event.summary,
      description: event.description || "",
      start: event.start,
      end: event.end,
      attendees: event.attendees || [],
      guestsCanModify: true
    }),
  }, 5);
}

export async function updateGoogleCalendarEvent(eventId: string, event: GoogleCalendarEventPayload, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {
    method: "PATCH",
    body: JSON.stringify({
      summary: event.summary,
      description: event.description || "",
      start: event.start,
      end: event.end,
      attendees: event.attendees || [],
      guestsCanModify: true
    }),
  }, 5);
}

export async function deleteGoogleCalendarEvent(eventId: string, employeeEmail?: string): Promise<any> {
  return fetchGoogleAPI(`calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {
    method: "DELETE"
  }, 5);
}

