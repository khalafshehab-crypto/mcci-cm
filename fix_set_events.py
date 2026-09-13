import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "setEvents(" in line:
        print(f"Line {i+1}: {line.strip()}")
