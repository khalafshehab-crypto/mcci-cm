import re

files = ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Add "RotateCcw" import if not present
    if "RotateCcw" not in content:
        content = content.replace("CheckCircle,", "CheckCircle, RotateCcw,")

    # 2. Add backward capability in Card View Gear Menu
    # We find the advance stage button in the card gear menu and append the regress button
    advance_btn_pattern = r'(\{\!\(rec\.status\?\.includes\("منجز"\) \|\| rec\.status\?\.includes\("مكتمل"\) \|\| rec\.status === "منجزة"\) && \(\s*<button[\s\S]*?<span>ترقية مسار الاعتماد</span>\s*<CheckCircle className="w-3\.5 h-3\.5" />\s*</button>\s*\)\})'
    
    regress_btn_rec = r"""\1
                                            
                                            {(() => {
                                              const currentStage = rec.approvalStage || "أخصائي";
                                              if (currentStage === "أخصائي") return null;
                                              return (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveGearMenuId(null);
                                                    let prevStage = "أخصائي";
                                                    if (currentStage === "مدير إدارة") prevStage = "رئيس قسم";
                                                    else if (currentStage === "مكتملة") prevStage = "مدير إدارة";
                                                    const prevStatus = prevStage === "أخصائي" ? "جديدة" : "جاري العمل عليها";
                                                    handleUpdateRecommendationStatus(rec.id, prevStatus, prevStage);
                                                  }}
                                                  className="w-full px-3 py-2 text-xs font-black text-amber-600 hover:bg-amber-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                                >
                                                  <span>تراجع مسار الاعتماد</span>
                                                  <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                              );
                                            })()}"""
    content = re.sub(advance_btn_pattern, regress_btn_rec, content)

    # 3. Add backward capability in Table View Gear Menu
    advance_btn_evt_pattern = r'(\{\!\(evt\.status\?\.includes\("منجز"\) \|\| evt\.status\?\.includes\("مكتمل"\) \|\| evt\.status === "منجزة"\) && \(\s*<button[\s\S]*?<span>ترقية مسار الاعتماد</span>\s*<CheckCircle className="w-3\.5 h-3\.5" />\s*</button>\s*\)\})'
    regress_btn_evt = r"""\1
      
      {(() => {
        const currentStage = evt.approvalStage || "أخصائي";
        if (currentStage === "أخصائي") return null;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGearMenuId(null);
              let prevStage = "أخصائي";
              if (currentStage === "مدير إدارة") prevStage = "رئيس قسم";
              else if (currentStage === "مكتملة") prevStage = "مدير إدارة";
              const prevStatus = prevStage === "أخصائي" ? "جديدة" : "جاري العمل عليها";
              handleUpdateRecommendationStatus(evt.id, prevStatus, prevStage);
            }}
            className="w-full px-3 py-2 text-xs font-black text-amber-600 hover:bg-amber-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
          >
            <span>تراجع مسار الاعتماد</span>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        );
      })()}"""
    content = re.sub(advance_btn_evt_pattern, regress_btn_evt, content)

    # 4. Extract motion.div for preparation platform
    start_str = r'<td colSpan=\{7\} className="p-0 bg-slate-50 border-t border-b border-gray-200 text-right font-sans">\s*(<motion\.div)'
    end_str = r'(\s*</motion\.div>)\s*</td>'

    match_start = re.search(start_str, content)
    match_end = re.search(end_str, content[match_start.end():])

    if match_start and match_end:
        div_start = match_start.end() - len(match_start.group(1))
        div_end = match_start.end() + match_end.end() - len(match_end.group(1)) + len('</motion.div>')
        
        platform_jsx = content[div_start:div_end]
        
        # Replace the platform in the table with the function call
        content = content[:div_start] + '{renderPreparationPlatform(evt)}' + content[div_end:]
        
        # Insert the function definition right before the main return statement
        main_return_match = re.search(r'\n\s*return \(\s*<div className="space-y-6 pb-16 text-right" dir="rtl">', content)
        if main_return_match:
            func_def = """
  const renderPreparationPlatform = (evt: any) => {
    const nextStep = getCalculatedNextStep(evt);
    return (
""" + platform_jsx + """
    );
  };
"""
            content = content[:main_return_match.start()] + func_def + content[main_return_match.start():]
            
            # Now find the card view and insert `{expandedEventId === rec.id && renderPreparationPlatform(rec)}` at the bottom of the card.
            # The card is a motion.div ending with audit logs.
            card_end = re.search(r'\{expandedRecLogsId === rec\.id && \([\s\S]*?</div>\s*\)\}\s*</div>\s*</div>\s*</motion\.div>', content)
            if card_end:
                insertion_point = card_end.end() - len('</motion.div>')
                card_insertion = """
        {expandedEventId === rec.id && (
          <div className="mt-4 border-t border-gray-200/60 pt-4 w-full">
            {renderPreparationPlatform(rec)}
          </div>
        )}
"""
                content = content[:insertion_point] + card_insertion + content[insertion_point:]
            else:
                print(f"Could not find card end in {file_path}")
        else:
            print(f"Could not find main return in {file_path}")
    else:
        print(f"Could not find the platform JSX in {file_path}")
        
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Extraction and insertion successful for {file_path}")

