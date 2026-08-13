with open('src/pages/CommitteesFormation.tsx', 'r') as f:
    content = f.read()

func_code = '''  const canUserEditCommittee = (committeeName: string): boolean => {'''

new_code = '''  const isUserAdmin = (): boolean => {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored) return true;
      const user = JSON.parse(stored);
      if (!user) return true;
      if (user.role === "SYS_ADMIN" || user.role === "مدير النظام" || user.role === "مدير إدارة") return true;
      return false;
    } catch (e) {
      return false;
    }
  };

  const canUserEditCommittee = (committeeName: string): boolean => {'''

content = content.replace(func_code, new_code)
with open('src/pages/CommitteesFormation.tsx', 'w') as f:
    f.write(content)
