import re

files_to_patch = ['src/pages/Events.tsx', 'src/pages/CommitteesEvents.tsx']

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace displayValue logic
    old_logic = 'const displayValue = (value && typeof value === "object" && "name" in value) ? (value as any).name : value;'
    new_logic = """
  const getDisplayValue = () => {
    if (!value) return "";
    if (typeof value === "string") {
      return value.startsWith("http") ? "تم رفع الملف بنجاح (رابط)" : value;
    }
    if (typeof value === "object" && value !== null) {
      return (value as any).name || "ملف مرفق";
    }
    return "ملف مرفق";
  };
  const displayValue = getDisplayValue();
"""
    content = content.replace(old_logic, new_logic.strip())
    
    with open(filepath, 'w') as f:
        f.write(content)

