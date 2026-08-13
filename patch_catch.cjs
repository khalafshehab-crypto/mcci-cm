const fs = require('fs');
const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  const oldCode = `} catch (error) {
																			console.error(error);
																			showGlobalToast("حدث خطأ أثناء القراءة", "error");
																		} finally {`;
  const newCode = `} catch (error: any) {
																			console.error(error);
																			showGlobalToast(error.message || "حدث خطأ أثناء القراءة", "error");
																		} finally {`;
  if (content.includes(oldCode)) {
      content = content.replace(oldCode, newCode);
      fs.writeFileSync(file, content);
      console.log('Patched catch block in ' + file);
  } else {
      console.log('Could not find catch block in ' + file);
  }
}
