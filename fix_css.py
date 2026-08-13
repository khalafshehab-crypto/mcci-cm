with open('src/index.css', 'r') as f:
    content = f.read()

replacement = """
  --color-brand: #246fff;
  --color-red-650: #ce1212;

  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-150: #eceeef;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-750: #2b3544;
  --color-gray-800: #1f2937;
  --color-gray-850: #18202f;
  --color-gray-900: #111827;
  --color-gray-950: #030712;
  --color-white: #ffffff;
  --color-black: #000000;
  --color-transparent: transparent;
"""

content = content.replace("--color-brand: #246fff;\n  --color-red-650: #ce1212;", replacement.strip())

with open('src/index.css', 'w') as f:
    f.write(content)
