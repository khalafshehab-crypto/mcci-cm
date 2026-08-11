const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const attachmentComponent = `
interface AttachmentInputProps {
  label: string;
  value: File | string | null;
  onChange: (val: File | string | null) => void;
  id: string;
}

function AttachmentInput({ label, value, onChange, id }: AttachmentInputProps) {
  const fileInputId = \`file-input-\${id}\`;

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
      className={\`border-2 border-dashed rounded-2xl p-3.5 text-center transition-all relative \${
        value
          ? "border-emerald-300 bg-emerald-50/40"
          : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/70"
      }\`}
    >
      <input
        type="file"
        id={fileInputId}
        className="hidden"
        onChange={handleFileChange}
      />
      <label htmlFor={fileInputId} className="cursor-pointer block space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-gray-700">{label}</span>
          {value ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100/80 text-emerald-800 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">مرفق</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-200/50 text-gray-500 rounded-lg">
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">إرفاق</span>
            </div>
          )}
        </div>
        
        {value ? (
          <div className="text-right">
            <span className="text-xs font-bold text-gray-600 block truncate" dir="ltr">
              {typeof displayValue === "string" && (displayValue.includes("drive.google") || displayValue.includes("http")) 
                ? "مرفق (رابط)" 
                : displayValue}
            </span>
          </div>
        ) : (
          <div className="text-[10px] text-gray-400 font-medium">
            اضغط أو اسحب الملف هنا
          </div>
        )}
      </label>
      
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange(null);
          }}
          className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-white border shadow-sm border-rose-200 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

`;

if (!content.includes('function AttachmentInput')) {
    content = content.replace('export interface Committee {', attachmentComponent + 'export interface Committee {');
    fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
    console.log("Added AttachmentInput to CommitteesFormation");
} else {
    console.log("AttachmentInput already exists");
}
