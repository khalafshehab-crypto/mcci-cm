import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

if 'useRef' not in content[:500]:
    content = content.replace('import React, { useState, useEffect, FormEvent } from "react";', 'import React, { useState, useEffect, FormEvent, useRef } from "react";')

if 'import jsPDF' not in content:
    content = 'import jsPDF from "jspdf";\nimport html2canvas from "html2canvas";\n' + content

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
