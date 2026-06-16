/**
 * Utility function to format committee names supporting standard grammatically correct Arabic rules.
 * 
 * - If the committee name is an adjective like "الصناعية", it returns "اللجنة الصناعية".
 * - If the committee name is a noun (or construct state) like "الإعلام والتسويق", it returns "لجنة الإعلام والتسويق".
 */
export const formatCommitteeNameArabic = (commName: string): string => {
  if (!commName) return "";
  const trimmed = commName.trim();
  
  // If it already starts with Arabic words "لجنة" or "اللجنة", don't format.
  if (trimmed.startsWith("لجنة ") || trimmed.startsWith("اللجنة ")) {
    return trimmed;
  }
  
  // Clean up any stray leading "لجنة" or "اللجنة" prefix that doesn't have spacing
  if (trimmed === "لجنة" || trimmed === "اللجنة") {
    return trimmed;
  }

  // Common relative adjectives used in committee names ending with "ية"
  // or other famous adjectives like "الصحية", "الطبية", "العامة", "النسائية", "السياحية"
  const isAdjective = 
    trimmed.endsWith("ية") || 
    trimmed.endsWith("يه") || 
    trimmed.endsWith("ية ") ||
    ["الطبية", "النسائية", "الصحية", "العامة", "الوطنية", "الدولية", "المحلية", "العقارية", "الصناعية", "الزراعية", "التجارية", "الثقافية", "التعليمية", "الترفيهية", "الاجتماعية", "الرياضية"].some(adj => trimmed.includes(adj));
                      
  if (isAdjective) {
    // Add "اللجنة" prefix cleanly. Ensure there's a leading "ال" in the name itself
    const baseName = trimmed.startsWith("ال") ? trimmed : `ال${trimmed}`;
    return `اللجنة ${baseName}`;
  } else {
    // Noun / genitive styling (construct state) e.g., "شباب الأعمال" -> "لجنة شباب الأعمال"
    // Add "لجنة " as prefix
    return `لجنة ${trimmed}`;
  }
};
