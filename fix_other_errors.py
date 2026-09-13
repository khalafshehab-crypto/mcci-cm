import re

# Tasks.tsx
with open('src/pages/Tasks.tsx', 'r', encoding='utf-8') as f:
    t = f.read()
t = t.replace('../components/toastUtils', '../lib/toastUtils')
with open('src/pages/Tasks.tsx', 'w', encoding='utf-8') as f:
    f.write(t)

# Events.tsx
with open('src/pages/Events.tsx', 'r', encoding='utf-8') as f:
    e = f.read()
e = re.sub(r'addFirebaseEvent\(\{\s*id: Date.now\(\),', r'addFirebaseEvent({', e)
with open('src/pages/Events.tsx', 'w', encoding='utf-8') as f:
    f.write(e)

# Recommendations.tsx
with open('src/pages/Recommendations.tsx', 'r', encoding='utf-8') as f:
    r = f.read()
if "updateFirebaseRecommendation" not in r[:500]:
    r = r.replace('deleteDocument: deleteFirebaseRecommendation } = useFirestoreCollection', 'updateDocument: updateFirebaseRecommendation, deleteDocument: deleteFirebaseRecommendation } = useFirestoreCollection')
with open('src/pages/Recommendations.tsx', 'w', encoding='utf-8') as f:
    f.write(r)

print("Done")
