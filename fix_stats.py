import re

files = ['src/pages/Home.tsx', 'src/pages/CommitteesHome.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Fix impactRecommendations hardcoding
    content = content.replace('.length || 2;', '.length;')

    # Fix inactiveRecommendations to include other statuses if needed, or better, calculate it as total - completed - active
    # actually, wait, the user's requirement: "التوصيات المتأخرة"
    # let's just make sure "متأخرة" is accurately mapped, and maybe "جديدة".
    # inactiveRecommendations = recs.filter((r: any) => r.status === "متأخرة" || r.status === "جديدة" || r.status === "تجهيز التوصية والمسودة" || !r.status).length;
    
    pattern_inactive_recs = r'inactiveRecommendations = recs\.filter\(\(r: any\) => r\.status === "متأخرة" \|\| r\.status === "جديدة"\)\.length;'
    replacement_inactive_recs = 'inactiveRecommendations = totalRecommendations - completedRecommendations - activeRecommendations;'
    
    if re.search(pattern_inactive_recs, content):
        content = re.sub(pattern_inactive_recs, replacement_inactive_recs, content)
        print(f"Fixed inactive recommendations in {file_path}")
        
    with open(file_path, 'w') as f:
        f.write(content)

print("Stats updated.")
