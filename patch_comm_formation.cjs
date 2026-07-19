const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// 1. Update Committee Interface
content = content.replace(
  /formationLetter\?: string;/,
  `formationLetter?: string;\n  membersApproval?: string;\n  regulations?: string;\n  guides?: string;`
);

// 2. Import readFileAsBase64, uploadBinaryFileToDrive
if (!content.includes('uploadBinaryFileToDrive')) {
  content = content.replace(
    /import \{ getCachedAccessToken, getSharedAccessToken, createAndPopulateSheet, getOrCreateFolder, subscribeToAccessToken, triggerAuthModal \} from "\.\.\/lib\/googleApi";/,
    `import { getCachedAccessToken, getSharedAccessToken, createAndPopulateSheet, getOrCreateFolder, subscribeToAccessToken, triggerAuthModal, uploadBinaryFileToDrive } from "../lib/googleApi";`
  );
}

// 3. Add AttachmentInput component
if (!content.includes('AttachmentInput')) {
  const attachmentInputCode = `

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
      className={\`border-2 border-dashed rounded-2xl p-3.5 text-center transition-all relative \${
        value
          ? "border-emerald-300 bg-emerald-50/40"
          : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/70"
      }\`}
    >
      <input
        type="file"
        id={id}
        className="hidden"
        onChange={handleFileChange}
      />
      {value ? (
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-emerald-800 max-w-full truncate px-2">{displayValue}</span>
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
          <span className="text-[8.5px] text-gray-400">سحب وإفلات أو تصفح</span>
        </label>
      )}
      {!value && (
        <div className="mt-2 pt-2 border-t border-gray-200/50">
          <input 
            type="text" 
            placeholder="أو ضع رابط جوجل درايف هنا..." 
            className="w-full text-[9px] p-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-right font-mono"
            onChange={(e) => {
              if(e.target.value) onChange(e.target.value);
            }}
          />
        </div>
      )}
    </div>
  );
}
`;
  content = content.replace(/export interface Committee/, attachmentInputCode + '\nexport interface Committee');
}

fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
