const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

content = content.replace(/onChange=\{\(e\) => \{\s*if \(e\.target\.files && e\.target\.files\.length > 0\) \{\s*const files = Array\.from\(e\.target\.files\) as File\[\];[\s\S]*?\}\}\}/g, `onChange={(e) => {
                                                      if (e.target.files && e.target.files.length > 0) {
                                                        handleFileUploads(Array.from(e.target.files), evt, attachmentsList || []);
                                                      }
                                                    }}`);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
