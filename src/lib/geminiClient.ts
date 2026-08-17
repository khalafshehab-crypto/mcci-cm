export const extractAgendaClient = async (
  prompt: string,
  fileBase64: string | null,
  mimeType: string | null,
  fileId: string | null,
  accessToken: string | null
) => {
  const response = await fetch('/api/gemini/extract-agenda', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      fileBase64,
      mimeType,
      fileId,
      accessToken
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to extract agenda");
  }

  const data = await response.json();
  return data.result;
};

export const replyToLetterClient = async (
  incomingLetter: string,
  fileBase64: string | null,
  mimeType: string | null
) => {
  const response = await fetch('/api/gemini/reply-to-letter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      incomingLetter,
      fileBase64,
      mimeType
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate reply");
  }

  const data = await response.json();
  return data.result;
};
