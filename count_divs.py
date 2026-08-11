import re

with open("step0.txt", "r") as f:
    text = f.read()

div_count = len(re.findall(r'<div\b', text))
end_div_count = len(re.findall(r'</div\b', text))

print(f"<div>: {div_count}")
print(f"</div>: {end_div_count}")
