with open('src/pages/CommitteesFormation.tsx', 'r') as f:
    content = f.read()

old_code = '''                    {/* Action controls - ⚙️ Custom settings gear button with menu */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-center relative whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 relative dropdown-container">
                        <button
                          onClick={() => setActiveGearMenuId(activeGearMenuId === comm.id ? null : comm.id)}'''

new_code = '''                    {/* Action controls - ⚙️ Custom settings gear button with menu */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-center relative whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 relative dropdown-container">
                        <button
                          onClick={() => setActiveCircularsComm(comm)}
                          style={{ display: isUserAdmin() ? 'flex' : 'none' }}
                          className="p-1.5 hover:bg-gray-150 text-brand hover:text-brand-dark rounded-lg border border-transparent hover:border-gray-350 transition-all cursor-pointer"
                          title="التعاميم"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveGearMenuId(activeGearMenuId === comm.id ? null : comm.id)}'''

content = content.replace(old_code, new_code)
with open('src/pages/CommitteesFormation.tsx', 'w') as f:
    f.write(content)
