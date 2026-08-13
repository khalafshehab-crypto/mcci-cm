import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

attachment_input_code = """
interface AttachmentInputProps {
  label: string;
  value: File | string | null;
  onChange: (val: File | string | null) => void;
  id: string;
}

function AttachmentInput({ label, value, onChange, id }: AttachmentInputProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };
  const displayValue = (value && typeof value === "object" && "name" in value) ? (value as any).name : value;
  
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl transition-all ${
        value
          ? "border-emerald-300 bg-emerald-50/40"
          : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/70"
      }`}
    >
      <input
        type="file"
        id={id}
        className="hidden"
        onChange={handleFileChange}
      />
      {value ? (
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-emerald-800 max-w-full truncate px-2">{displayValue}</span>
          <div className="flex items-center gap-2 mt-1 w-full">
            <input 
              type="text" 
              placeholder="إعادة التسمية (اختياري)" 
              className="flex-1 text-[9px] p-1 border border-gray-200 rounded"
              onChange={(e) => {
                if (typeof value === 'object' && value !== null) {
                  // We can't rename a File object directly easily without making a new one, 
                  // but we can just store the custom name in a separate state if needed, 
                  // OR we can create a new File object:
                  const newFile = new File([value], e.target.value || value.name, { type: value.type });
                  onChange(newFile);
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onChange(null); }}
            className="text-[9px] text-rose-500 hover:text-rose-600 font-bold underline mt-1"
          >
            حذف المرفق
          </button>
        </div>
      ) : (
        <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Upload className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[10px] font-bold text-gray-600">
            {label}
          </span>
          <span className="text-[8.5px] text-gray-400">سحب وإفلات</span>
        </label>
      )}
    </div>
  );
}

"""

# Let's see where we can insert it.
# We'll insert it after the imports.
import_end_idx = content.find("export default function CommitteesLibrary()")
content = content[:import_end_idx] + attachment_input_code + content[import_end_idx:]

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
