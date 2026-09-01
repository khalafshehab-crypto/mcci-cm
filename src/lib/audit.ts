import { addDoc, collection, db } from "./firebase";

export const logSystemAction = async (
  userName: string,
  actionType: "إنشاء" | "تعديل" | "حذف" | "إحالة",
  moduleName: string,
  details: string
) => {
  try {
    const logEntry = {
      userName: userName || "النظام",
      actionType,
      moduleName,
      details,
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, "system_logs"), logEntry);
    console.log("Logged action:", logEntry);
  } catch (error) {
    console.error("Failed to log system action:", error);
  }
};
