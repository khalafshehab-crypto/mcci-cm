import re

files_to_fix = [
    'src/pages/CommitteesMembers.tsx',
    'src/pages/Members.tsx'
]

replacement = """  const renderAvatar = (name: string, photo?: string, className: string = "w-12 h-12 rounded-2xl") => {
    let driveFileId = "";
    if (photo) {
      const matchD = photo.match(/drive\\.google\\.com\\/file\\/d\\/([a-zA-Z0-9_-]+)/);
      const matchId = photo.match(/id=([a-zA-Z0-9_-]+)/);
      if (matchD && matchD[1]) {
        driveFileId = matchD[1];
      } else if (photo.includes("drive.google.com") && matchId && matchId[1]) {
        driveFileId = matchId[1];
      }
    }
    
    const fallbackClass = `${className} bg-gradient-to-br from-brand/90 to-[#4ea0b0]/90 text-white flex items-center justify-center font-black text-sm tracking-wide shadow-md shadow-brand/15 group-hover:scale-105 transition-transform`;
"""

for filepath in files_to_fix:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        pattern = re.compile(r'  const renderAvatar = \(name: string, photo\?: string, className: string = "w-12 h-12 rounded-2xl"\) => {\s*let driveFileId = "";\s*if \(photo && photo\.includes\("drive\.google\.com/file/d/"\)\) {\s*const match = photo\.match\(/d\\/\(\[a-zA-Z0-9_-\]\+\)/\);\s*if \(match && match\[1\]\) {\s*driveFileId = match\[1\];\s*}\s*}\s*const fallbackClass = `\$\{className\} bg-gradient-to-br from-brand/90 to-\[#4ea0b0\]/90 text-white flex items-center justify-center font-black text-sm tracking-wide shadow-md shadow-brand/15 group-hover:scale-105 transition-transform`;')
        
        if pattern.search(content):
            new_content = pattern.sub(replacement, content)
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Fixed {filepath}")
        else:
            print(f"Could not match pattern in {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

