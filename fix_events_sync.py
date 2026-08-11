import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Import
    if 'autoCreateEventDriveFolders' not in content:
        if 'import { showGlobalToast } from "../lib/toastUtils";' in content:
            content = content.replace(
                'import { showGlobalToast } from "../lib/toastUtils";',
                'import { showGlobalToast } from "../lib/toastUtils";\nimport { autoCreateEventDriveFolders } from "../lib/googleApi";'
            )
        else:
            content = 'import { autoCreateEventDriveFolders } from "../lib/googleApi";\n' + content

    old_close = """onClick={() => updateEventWorkflow(evt.id, { exportedRecommendationsToPage: true })}"""
    new_close = """onClick={async () => {
                                                              updateEventWorkflow(evt.id, { exportedRecommendationsToPage: true });
                                                              showGlobalToast("جاري إنشاء ملفات الفعالية في جوجل درايف...", "loading", 0);
                                                              const success = await autoCreateEventDriveFolders(evt, []);
                                                              if (success) showGlobalToast("تم إنشاء ملف الفعالية بنجاح في درايف", "success");
                                                              else showGlobalToast("حدث خطأ أثناء مزامنة درايف", "error");
                                                            }}"""

    content = content.replace(old_close, new_close)


    old_export = """                                        const handleConfirmExportFinal = async () => {
                                          const selectedIds = recsToExport
                                            .filter(item => !!selectedAgendaRecsExport[`${evt.id}-${item.id}`])
                                            .map(item => item.id);

                                          const count = await exportRecommendationsToLocalStorage(evt, selectedIds);
                                          updateEventWorkflow(evt.id, { exportedRecommendationsToPage: true });
                                        };"""

    new_export = """                                        const handleConfirmExportFinal = async () => {
                                          const selectedIds = recsToExport
                                            .filter(item => !!selectedAgendaRecsExport[`${evt.id}-${item.id}`])
                                            .map(item => item.id);

                                          const count = await exportRecommendationsToLocalStorage(evt, selectedIds);
                                          updateEventWorkflow(evt.id, { exportedRecommendationsToPage: true });

                                          showGlobalToast("جاري إنشاء ملفات الفعالية والتوصيات في جوجل درايف...", "loading", 0);
                                          const selectedRecs = recsToExport.filter(item => !!selectedAgendaRecsExport[`${evt.id}-${item.id}`]);
                                          const success = await autoCreateEventDriveFolders(evt, selectedRecs);
                                          if (success) showGlobalToast("تم المزامنة بنجاح مع درايف", "success");
                                          else showGlobalToast("تم الترحيل محلياً ولكن حدث خطأ في مزامنة درايف", "error");
                                        };"""

    if old_export in content:
        content = content.replace(old_export, new_export)
        
    with open(filename, 'w') as f:
        f.write(content)
    print(f"Updated {filename}")


fix_file("src/pages/Events.tsx")
fix_file("src/pages/CommitteesEvents.tsx")
