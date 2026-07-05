import re
import sys

def find_block_end(text, start_idx):
    stack = 0
    in_string = False
    string_char = ''
    
    for i in range(start_idx, len(text)):
        char = text[i]
        
        if in_string:
            if char == string_char and text[i-1] != '\\':
                in_string = False
            continue
            
        if char in '"\'`':
            in_string = True
            string_char = char
            continue
            
        if char == '(':
            stack += 1
        elif char == ')':
            stack -= 1
            if stack == 0:
                return i
                
    return -1

with open('src/pages/CentersEvents.tsx', 'r') as f:
    content = f.read()

match = re.search(r'\{isExpanded && \(', content)
if match:
    start_idx = match.end() - 1
    end_idx = find_block_end(content, start_idx)
    print(f"Start: {match.start()}, End: {end_idx}")
    
    # print some lines around the end
    lines = content.split('\n')
    end_line = content[:end_idx].count('\n')
    print(f"End line: {end_line}")
    for i in range(max(0, end_line - 5), min(len(lines), end_line + 5)):
        print(f"{i+1}: {lines[i]}")
