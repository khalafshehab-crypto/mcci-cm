import os
import re

files_to_edit = [
    'src/pages/AssistantSecGen.tsx',
    'src/pages/Centers.tsx',
    'src/pages/Affiliates.tsx',
    'src/pages/Home.tsx'
]

pattern = r'\/\/\s*Filter out inactive ones[\s\S]*?setOnlineStaff\(mapped\);'

replacement = """// Filter out inactive ones
        const activeEmps = allowedEmps.filter(emp => emp.active !== false);
        const listToUse = activeEmps.length > 0 ? activeEmps : allowedEmps;

        const now = Date.now();
        const THIRTY_MINUTES = 30 * 60 * 1000;
        const TWO_HOURS = 2 * 60 * 60 * 1000;
        const todayStr = new Date().toISOString().split('T')[0];

        const mapped = listToUse.map((emp, index) => {
          const nameStr = emp.name || "";
          const words = nameStr.split(" ");
          const avatar = words.length >= 2 ? (words[0][0] + " " + (words[1][0] || "")) : ((words[0] && words[0][0]) || "م");
          const colors = ["bg-blue-600", "bg-teal-600", "bg-indigo-600", "bg-purple-600", "bg-amber-500", "bg-rose-500", "bg-emerald-600"];
          const color = colors[index % colors.length];
          
          let status = "خارج المكتب";
          let lastActive = emp.lastActive || 0;
          
          if (now - lastActive < TWO_HOURS) {
            status = "مشغول";
            if (now - lastActive < THIRTY_MINUTES) {
              status = "متصل";
            }
          }

          // Check if employee has a confirmed event today
          if (status !== "خارج المكتب") {
             const hasMeeting = (dbEvents || []).some((evt: any) => {
                 if (!evt.date || !evt.date.startsWith(todayStr)) return false;
                 if (evt.status === "مؤكد" || evt.committeeConfirmed || evt.attendanceConfirmed || evt.status === "تأكيد الحضور" || evt.status === "محضر الاجتماع") {
                     if (emp.committees && Array.isArray(emp.committees) && evt.committeeName) {
                         return emp.committees.includes(evt.committeeName);
                     }
                 }
                 return false;
             });
             if (hasMeeting) {
                 status = "في اجتماع";
             }
          }

          const presetAvatars = [
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200", // Male 1
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", // Female 1
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200", // Male 2
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200", // Female 2
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200", // Male 3
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", // Female 3
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" // Male 4
          ];
          const photo = emp.photo || presetAvatars[index % presetAvatars.length];
          return {
            name: emp.name,
            title: emp.jobTitle || emp.roleAr || "أخصائي لجان",
            avatar: avatar.trim(),
            photo,
            color,
            status,
            lastActive
          };
        }).filter(emp => emp.status !== "خارج المكتب").sort((a, b) => b.lastActive - a.lastActive).slice(0, 7);
        setOnlineStaff(mapped);"""

for file_path in files_to_edit:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = re.sub(pattern, replacement, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {file_path}")
