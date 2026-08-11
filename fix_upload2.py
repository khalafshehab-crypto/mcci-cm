import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    old_logic = """          } else {
            files.forEach(f => newAtts.push({
              name: f.name,
              url: "#",
              size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
              date: new Date().toLocaleDateString('ar-SA')
            }));
          }

          updateEventWorkflow(evt.id, { attachments: [...existingAtts, ...newAtts] });
          showGlobalToast(`تمت المزامنة وحفظ الملفات بنجاح في المسار: أرشيف اللجان - الدورة 22/${parts.join('/')}`, "success");
        } catch (err: any) {"""

    new_logic = """          } else {
            files.forEach(f => newAtts.push({
              name: f.name,
              url: "#",
              size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
              date: new Date().toLocaleDateString('ar-SA')
            }));
          }

          updateEventWorkflow(evt.id, { attachments: [...existingAtts, ...newAtts] });
          showGlobalToast(`تمت المزامنة وحفظ الملفات بنجاح في المسار: ${pathVal}`, "success");
        } catch (err: any) {"""

    if old_logic in content:
        content = content.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Could not find exact block in {filename}")

fix_file("src/pages/CommitteesRecommendations.tsx")
