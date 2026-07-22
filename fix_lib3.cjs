const fs = require('fs');
let code = fs.readFileSync('src/pages/Library.tsx', 'utf8');

const target = `          </div>
        
        </div>
      </div>

      {/* -------------------- Unified Google Workspace Integration Center -------------------- */}`;

const replacement = `          </div>
          <button
            type="button"
            onClick={() => setShowWorkspaceCenter(!showWorkspaceCenter)}
            className={\`h-10 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto \${
              showWorkspaceCenter
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }\`}
          >
            <RefreshCw
              className={\`w-4 h-4 \${showWorkspaceCenter ? "animate-spin" : ""}\`}
            />
            <span>
              {showWorkspaceCenter
                ? "إغلاق بوابة Google Workspace"
                : "مزامنة Google Workspace 🌐"}
            </span>
          </button>
        </div>
      </div>

      {/* -------------------- Unified Google Workspace Integration Center -------------------- */}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Library.tsx', code);
