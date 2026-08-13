const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const searchStr = `																			const textResult = await response.text();
																			try {
																				const jsonMatch = textResult.match(/\\[.*\\]/s);
																				let parsedItems = [];
																				if (jsonMatch) {
																					parsedItems = JSON.parse(jsonMatch[0]);
																				} else {
																					const bareJsonMatch = textResult.match(/{.*}/s);
																					if (bareJsonMatch) {
																						const res = JSON.parse(bareJsonMatch[0]);
																						if (res.result) {
																							const arrMatch = res.result.match(/\\[.*\\]/s);
																							if (arrMatch) parsedItems = JSON.parse(arrMatch[0]);
																						}
																					}
																				}`;
																				
  const replaceStr = `																			const responseData = await response.json();
																			const aiText = responseData.result || "";
																			try {
																				const jsonMatch = aiText.match(/\\[.*\\]/s);
																				let parsedItems = [];
																				if (jsonMatch) {
																					parsedItems = JSON.parse(jsonMatch[0]);
																				}`;
																				
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    
    // Also change the catch block toast text from "تمت القراءة بنجاح، يرجى مراجعة البنود" to "حدث خطأ في فهم البنود المستخرجة"
    content = content.replace(/"تمت القراءة بنجاح، يرجى مراجعة البنود", "success"/g, '"حدث خطأ في فهم البنود المستخرجة", "error"');
    
    fs.writeFileSync(file, content);
    console.log('Fixed parsing in ' + file);
  } else {
    console.log('Could not find search string in ' + file);
  }
}
