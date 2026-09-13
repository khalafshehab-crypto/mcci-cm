import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    cr_content = f.read()

with open('src/pages/Recommendations.tsx', 'r', encoding='utf-8') as f:
    r_content = f.read()

# Extract the main return from CommitteesRecommendations.tsx
# It starts at:   return (\n    <div className="space-y-6 pb-16 text-right" dir="rtl">
# And ends at the end of the file.

match = re.search(r'(  return \(\n    <div className="space-y-6 pb-16 text-right" dir="rtl">.*)', cr_content, flags=re.DOTALL)
if match:
    main_return_block = match.group(1)
    
    # Replace the error return block in Recommendations.tsx
    r_content = re.sub(
        r'  return \(\n    <div className="w-full text-center p-10 text-xl font-bold">\n      حدث خطأ في النظام. يرجى التحديث.\n    </div>\n  \);\n\}',
        main_return_block,
        r_content
    )
    
    with open('src/pages/Recommendations.tsx', 'w', encoding='utf-8') as f:
        f.write(r_content)
    print("Done copying render block to Recommendations.tsx")
else:
    print("Could not find main return block in CommitteesRecommendations.tsx")
