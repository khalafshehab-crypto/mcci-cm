import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    old_logic = """                                                  </p>
                                                </label>
                                              </div>
                                              
                                                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 font-sans relative z-20">"""

    new_logic = """                                                  </p>
                                                </label>
                                              
                                                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 font-sans relative z-20">"""

    if old_logic in content:
        content = content.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Could not find exact block in {filename}")

fix_file("src/pages/CommitteesRecommendations.tsx")
