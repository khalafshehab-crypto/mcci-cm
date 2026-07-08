import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """                  // Count events/meetings under this committee
                  const commSessions = events.filter((e) => e.committeeId === comm.id && !e.exportedRecommendationsToPage);
                  const sessionsCount = commSessions.length;

                  // Count recommendations under this committee
                  const commRecsCount = filteredEvents.filter((e) => e.committeeId === comm.id).length;"""

new_code = """                  // Count events/meetings under this committee
                  const commSessions = events.filter((e) => e.committeeId === comm.id && !e.exportedRecommendationsToPage);
                  const sessionsCount = commSessions.length;

                  // Count recommendations under this committee
                  const dbRecsCount = allDbRecommendations.filter((rec: any) => {
                    const matchedEvent = events.find((e) => e.title === rec.eventName || String(rec.id).includes(`custom-rec-${e.id}-`));
                    return matchedEvent?.committeeId === comm.id;
                  }).length;
                  
                  const agendaRecsCount = commSessions.reduce((acc, evt) => {
                    return acc + (evt.agenda || []).filter((g: any) => g.recommendation && g.recommendation.trim() !== "").length;
                  }, 0);
                  
                  const standaloneRecsCount = events.filter((e) => e.committeeId === comm.id && e.exportedRecommendationsToPage).length;
                  
                  const commRecsCount = dbRecsCount + agendaRecsCount + standaloneRecsCount;"""

new_content = content.replace(old_code, new_code)

with open('src/pages/CommitteesRecommendations.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed counts successfully")
