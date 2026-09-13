import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Are there any other occurrences of "Target user token expired"?
if "Target user token expired" in content:
    print("WARNING: still found Target user token expired")
else:
    print("CLEAN!")
