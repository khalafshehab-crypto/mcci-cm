import re

with open("step0.txt", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    divs = re.findall(r'<div\b', line)
    end_divs = re.findall(r'</div\b', line)
    if divs or end_divs:
        print(f"{i+1:3}: {line.strip()}")
