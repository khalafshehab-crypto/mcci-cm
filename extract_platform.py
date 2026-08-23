import re

file_path = 'src/pages/CommitteesRecommendations.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Find the motion.div for the preparation platform
start_str = r'<td colSpan=\{7\} className="p-0 bg-slate-50 border-t border-b border-gray-200 text-right font-sans">\s*(<motion\.div)'
end_str = r'(\s*</motion\.div>)\s*</td>'

match_start = re.search(start_str, content)
match_end = re.search(end_str, content[match_start.end():])

if match_start and match_end:
    div_start = match_start.end() - len(match_start.group(1))
    div_end = match_start.end() + match_end.end() - len(match_end.group(1)) + len('</motion.div>')
    
    platform_jsx = content[div_start:div_end]
    
    # Replace the platform in the table with the function call
    new_content = content[:div_start] + '{renderPreparationPlatform(evt)}' + content[div_end:]
    
    # Insert the function definition right before "return (" of the main component
    # We find the main return ( which should be after all hooks, around line 2215
    main_return_match = re.search(r'\n\s*return \(\s*<div className="flex-1 flex flex-col', new_content)
    if not main_return_match:
        print("Could not find main return")
    else:
        func_def = """
  const renderPreparationPlatform = (evt: any) => {
    const nextStep = getCalculatedNextStep(evt);
    return (
""" + platform_jsx + """
    );
  };
"""
        new_content = new_content[:main_return_match.start()] + func_def + new_content[main_return_match.start():]
        
        # Now find the card view and insert `{expandedEventId === rec.id && renderPreparationPlatform(rec)}` at the bottom of the card.
        # The card is a motion.div around line 2556. It ends with:
        # {/* Audit logs trigger */} ... </motion.div>
        card_end = re.search(r'\{expandedRecLogsId === rec\.id && \([\s\S]*?</div>\s*\)\}\s*</motion\.div>', new_content)
        if card_end:
            insertion_point = card_end.end() - len('</motion.div>')
            card_insertion = """
        {expandedEventId === rec.id && (
          <div className="mt-4 border-t border-gray-200/60 pt-4 w-full">
            {renderPreparationPlatform(rec)}
          </div>
        )}
"""
            new_content = new_content[:insertion_point] + card_insertion + new_content[insertion_point:]
        else:
            print("Could not find card end")
            
        with open(file_path, 'w') as f:
            f.write(new_content)
        print("Extraction and insertion successful for CommitteesRecommendations.tsx")
else:
    print("Could not find the platform JSX")

