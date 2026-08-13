with open('src/pages/CommitteesFormation.tsx', 'r') as f:
    content = f.read()

old_code = '''                {/* ⚙️ Settings Gear Button with Dropdown logic */}
                <div className="absolute top-4 left-4 z-20">
                  <button
                    onClick={() => setActiveGearMenuId(activeGearMenuId === comm.id ? null : comm.id)}
                    style={{ display: canUserEditCommittee(comm.name) ? 'flex' : 'none' }}
                    className="p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-950 rounded-lg border border-gray-200/80 shadow-sm transition-all cursor-pointer"
                    title="التحكم باللجنة"
                  >
                    <Settings className="w-4 h-4 animate-hover-spin" />
                  </button>'''

new_code = '''                {/* ⚙️ Settings Gear Button with Dropdown logic */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <button
                    onClick={() => setActiveCircularsComm(comm)}
                    style={{ display: isUserAdmin() ? 'flex' : 'none' }}
                    className="p-1.5 bg-white/80 hover:bg-white text-brand hover:text-brand-dark rounded-lg border border-gray-200/80 shadow-sm transition-all cursor-pointer"
                    title="التعاميم"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveGearMenuId(activeGearMenuId === comm.id ? null : comm.id)}
                    style={{ display: canUserEditCommittee(comm.name) ? 'flex' : 'none' }}
                    className="p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-950 rounded-lg border border-gray-200/80 shadow-sm transition-all cursor-pointer"
                    title="التحكم باللجنة"
                  >
                    <Settings className="w-4 h-4 animate-hover-spin" />
                  </button>'''

content = content.replace(old_code, new_code)
with open('src/pages/CommitteesFormation.tsx', 'w') as f:
    f.write(content)
