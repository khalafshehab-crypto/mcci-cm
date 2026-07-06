import re

with open('src/pages/AssistantSecGen.tsx', 'r') as f:
    content = f.read()

pattern = r'const dbEvents = React\.useMemo\(\(\) => \[\.\.\.dbEvents1, \.\.\.dbEvents2, \.\.\.dbEvents3, \.\.\.dbEvents4\], \[dbEvents1, dbEvents2, dbEvents3, dbEvents4\]\);'

new_code = """const dbEvents = React.useMemo(() => [
    ...(dbEvents1 || []).map(e => ({ ...e, _collectionName: "assistant_sec_gen_events" })),
    ...(dbEvents2 || []).map(e => ({ ...e, _collectionName: "events" })),
    ...(dbEvents3 || []).map(e => ({ ...e, _collectionName: "affiliates_events" })),
    ...(dbEvents4 || []).map(e => ({ ...e, _collectionName: "centers_events" }))
  ], [dbEvents1, dbEvents2, dbEvents3, dbEvents4]);"""

content = content.replace(pattern, new_code)
with open('src/pages/AssistantSecGen.tsx', 'w') as f:
    f.write(content)
