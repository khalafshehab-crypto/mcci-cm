import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_block = '''        <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Upload className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[10px] font-bold text-gray-600">
            {label}
          </span>
          <span className="text-[8.5px] text-gray-400">سحب وإفلات</span>
        </label>
      )}
    </div>'''

new_block = '''        <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-1.5 w-full">
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
        <div className="mt-2 pt-2 border-t border-gray-200/50 w-full">
          <input 
             type="text" 
             placeholder="أو ضع رابط هنا..." 
             className="w-full text-[9px] p-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-right font-mono bg-white/50"
            onChange={(e) => {
              if(e.target.value) onChange(e.target.value);
            }}
          />
        </div>
      )}
    </div>'''

content = content.replace(old_block, new_block)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
