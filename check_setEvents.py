import os
files = [
    'src/pages/CommitteesRecommendations.tsx',
    'src/pages/Recommendations.tsx',
    'src/pages/Events.tsx'
]
for f in files:
    if os.path.exists(f):
        with open(f) as file:
            c = file.read()
            if "setEvents(" in c:
                print("FOUND in", f)
            else:
                print("CLEAN", f)
