import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    new_logic = """
export async function autoCreateEventDriveFolders(evt: any, recommendations: any[]) {
  try {
    let token = await getSharedAccessToken();
    if (!token) {
      token = await triggerAuthModal();
      if (!token) return false;
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
           await getOrCreateFolder((rec.title || rec.recommendation).substring(0, 50), recommendationsFolderId);
        }
      }
    }

    return true;
  } catch(err) {
    console.error("Failed to auto create event folders", err);
    return false;
  }
}
"""

    if "autoCreateEventDriveFolders" not in content:
        content = content + new_logic
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Already contains logic in {filename}")

fix_file("src/lib/googleApi.ts")
