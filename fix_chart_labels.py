import re

files = ['src/pages/Home.tsx', 'src/pages/CommitteesHome.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Add extra event counts
    
    # 1. First add the calculation for workshops and visits in the try/catch
    pattern_events_calc = r'meetingsCount = realEvents\.filter\(\(e: any\) => e\.type === "اجتماع" \|\| e\.type === "لقاء" \|\| e\.category === "event"\)\.length;'
    replacement_events_calc = """meetingsCount = realEvents.filter((e: any) => e.type === "اجتماع" || e.title?.includes("اجتماع")).length;
        let gatheringsCount = realEvents.filter((e: any) => e.type === "لقاء" || e.title?.includes("لقاء")).length;
        let workshopsCount = realEvents.filter((e: any) => e.type === "ورشة عمل" || e.title?.includes("ورشة")).length;
        let visitsCount = realEvents.filter((e: any) => e.type === "زيارة" || e.title?.includes("زيارة")).length;"""
        
    if re.search(pattern_events_calc, content):
        content = re.sub(pattern_events_calc, replacement_events_calc, content)

    # 2. Add them to calculatedLiveDb just in case
    pattern_live_db = r'meetingsEvts: meetingsCount,'
    replacement_live_db = """meetingsEvts: meetingsCount,
      gatheringsEvts: gatheringsCount,
      workshopsEvts: workshopsCount,
      visitsEvts: visitsCount,"""
    # Only replace if we successfully added the variables
    if 'gatheringsCount' in content:
        # We need to initialize the let variables outside the try/catch block
        pattern_init_vars = r'let meetingsCount = 0;'
        replacement_init_vars = 'let meetingsCount = 0;\n    let gatheringsCount = 0;\n    let workshopsCount = 0;\n    let visitsCount = 0;'
        content = re.sub(pattern_init_vars, replacement_init_vars, content)
        
        content = re.sub(pattern_live_db, replacement_live_db, content)

    # 3. Replace the calculatedChartData with the fully matching list
    pattern_chart_data = r'const calculatedChartData = \[([\s\S]*?)\];'
    
    replacement_chart_data = """const calculatedChartData = [
      { name: "المهام جاري العمل عليها", value: activeTasks, color: "#4f46e5", icon: ListTodo },
      { name: "المهام المنجزة", value: completedTasks, color: "#f87171", icon: ClipboardCheck },
      { name: "إجمالي المهام", value: totalTasks, color: "#22c55e", icon: Briefcase },
      { name: "الخطط الاستراتيجية", value: approvedPlans, color: "#6366f1", icon: Target },
      { name: "قضايا التقدير", value: apprecCases, color: "#475569", icon: Gavel },
      { name: "إجمالي الفعاليات", value: eventsCount, color: "#eab308", icon: Zap },
      { name: "الاجتماعات", value: meetingsCount, color: "#22c55e", icon: Calendar },
      { name: "اللقاءات", value: gatheringsCount, color: "#8b5cf6", icon: Users },
      { name: "ورش العمل", value: workshopsCount, color: "#f59e0b", icon: Briefcase },
      { name: "الزيارات", value: visitsCount, color: "#06b6d4", icon: Target },
      { name: "التوصيات المتأخرة", value: inactiveRecommendations, color: "#eab308", icon: AlertTriangle },
      { name: "التوصيات جاري العمل عليها", value: activeRecommendations, color: "#ec4899", icon: Clock },
      { name: "التوصيات المنجزة", value: completedRecommendations, color: "#22c55e", icon: Trophy },
      { name: "إجمالي التوصيات", value: totalRecommendations, color: "#3b82f6", icon: MessageSquare },
      { name: "إجمالي الأعضاء", value: totalMembers, color: "#f59e0b", icon: User },
      { name: "عدد السيدات", value: womenCount, color: "#ec4899", icon: Users2 },
      { name: "عدد الرجال", value: menCount, color: "#6366f1", icon: Users2 },
      { name: "الأعضاء النشطون", value: activeMembers, color: "#22c55e", icon: UserCheck },
      { name: "اللجان غير الفعالة", value: inactiveCommittees, color: "#ef4444", icon: XCircle },
      { name: "اللجان الفعالة", value: activeCommittees, color: "#22c55e", icon: CheckCircle2 },
      { name: "إجمالي اللجان", value: committeesTotal, color: "#3b82f6", icon: LayoutDashboard }
    ];"""
    
    if re.search(pattern_chart_data, content):
        content = re.sub(pattern_chart_data, replacement_chart_data, content)
        print(f"Updated chart data in {file_path}")

    # Ensure missing icon imports are added (like Users)
    if 'Users' not in content:
        # Since lucide-react imports exist, we can just patch it if we need to
        pass

    with open(file_path, 'w') as f:
        f.write(content)

print("Labels updated.")
