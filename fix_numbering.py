import re

logic_str = """
const ordinalsToNumGlobal: Record<string, string> = {
  "التأسيسي": "1", "الأول": "1", "الثاني": "2", "الثالث": "3", "الرابع": "4", "الخامس": "5",
  "السادس": "6", "السابع": "7", "الثامن": "8", "التاسع": "9", "العاشر": "10",
  "الحادي عشر": "11", "الثاني عشر": "12", "الثالث عشر": "13", "الرابع عشر": "14", "الخامس عشر": "15",
  "السادس عشر": "16", "السابع عشر": "17", "الثامن عشر": "18", "التاسع عشر": "19", "العشرون": "20"
};

const getMeetingNumber = (title: string) => {
  if (!title) return "1";
  for (const [key, val] of Object.entries(ordinalsToNumGlobal)) {
    if (title.includes(` ${key} `) || title.endsWith(` ${key}`) || title.includes(`(${key})`) || title.includes(` ${key}`)) {
      return val;
    }
  }
  const match = title.match(/(\d+)/);
  if (match) return match[1];
  return "1";
};

const getCommitteeAbbrev = (name: string) => {
  if (!name) return "عام";
  const words = name.replace(/و/g, ' ').split(/\s+/).filter(w => w.trim() !== '' && !['في', 'من', 'عبر', 'على', 'لجنة', 'اللجنة', 'قطاع'].includes(w));
  return 'ل ' + words.map(w => w.replace(/^ال/, '')[0]).join(' ');
};

const getItemNumber = (recTitle: string) => {
    const match = recTitle.match(/توصية البند (.*?) "/);
    if (match && match[1]) {
        return ordinalsToNumGlobal[match[1]] || "1";
    }
    return "1";
};

const getYearStr = (dateStr: string) => {
    if (!dateStr) return "26";
    const year = new Date(dateStr).getFullYear();
    if (isNaN(year)) return "26";
    return year.toString().slice(-2);
};

const generateRecommendationRefNumber = (evt: any) => {
    // Check if it's already generated and stored, otherwise generate dynamically
    if (evt.refNumber) return evt.refNumber;
    
    // For manual/standalone recommendations without an eventName, fallback to a simple hash
    if (!evt.eventName || !String(evt.id).startsWith("custom-rec-")) {
        return `REC-${String(evt.id || "").substring(0, 5).toUpperCase()}`;
    }
    
    const cAbbrev = getCommitteeAbbrev(evt.committeeName || "");
    const mNum = getMeetingNumber(evt.eventName || "");
    const iNum = getItemNumber(evt.title || "");
    const yr = getYearStr(evt.date);
    return `${cAbbrev}-${mNum}-${iNum}-${yr}`;
};
"""

target_files = ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx']

for file in target_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # 1. Insert the logic functions near the top (e.g. after the imports/constants)
    if "generateRecommendationRefNumber" not in content:
        # find the end of imports. simple heuristic: after DAYSMaps or CLASSIFICATIONS
        insert_idx = content.find("const getArabicOrdinalGlobal")
        if insert_idx != -1:
            content = content[:insert_idx] + logic_str + "\n" + content[insert_idx:]
        else:
            # Fallback
            insert_idx = content.find("export default function")
            content = content[:insert_idx] + logic_str + "\n" + content[insert_idx:]
            
    # 2. Replace the HTML for numbering
    pattern = r'REC-\{String\(evt\.id \|\| ""\)\.substring\(0, 5\)\.toUpperCase\(\)\}'
    replacement = r'{generateRecommendationRefNumber(evt)}'
    
    new_content = re.sub(pattern, replacement, content)
    
    with open(file, 'w') as f:
        f.write(new_content)
    print(f"Fixed numbering in {file}")

