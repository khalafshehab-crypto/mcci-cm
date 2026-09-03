import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.cjs')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('./src');
files.push('./firestore.rules');
files.push('./patch_purge.cjs');

let modifiedCount = 0;
for (const file of files) {
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf-8');
    
    // Pattern 1: || lowerEmail === "khalafshehab-crypto@gmail.com"
    content = content.replace(/\s*\|\|\s*lowerEmail\s*===\s*["']khalafshehab-crypto@gmail\.com["']/g, '');
    
    // Pattern 2: || emp.email?.trim().toLowerCase() === "khalafshehab-crypto@gmail.com"
    content = content.replace(/\s*\|\|\s*emp\.email\?\.trim\(\)\.toLowerCase\(\)\s*===\s*["']khalafshehab-crypto@gmail\.com["']/g, '');
    
    // Pattern 3: e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com" &&
    content = content.replace(/e\.email\?\.trim\(\)\.toLowerCase\(\)\s*!==\s*["']khalafshehab-crypto@gmail\.com["']\s*&&\s*/g, '');

    // Pattern 4: e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com"
    // Usually part of: e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com"
    content = content.replace(/\s*&&\s*e\.email\?\.trim\(\)\.toLowerCase\(\)\s*!==\s*["']khalafshehab-crypto@gmail\.com["']/g, '');
    
    // Pattern 5: || emailLower === "khalafshehab-crypto@gmail.com"
    content = content.replace(/\s*\|\|\s*emailLower\s*===\s*["']khalafshehab-crypto@gmail\.com["']/g, '');

    // Pattern 6: emp.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com" &&
    content = content.replace(/emp\.email\?\.trim\(\)\.toLowerCase\(\)\s*!==\s*["']khalafshehab-crypto@gmail\.com["']\s*&&\s*/g, '');
    content = content.replace(/\s*&&\s*emp\.email\?\.trim\(\)\.toLowerCase\(\)\s*!==\s*["']khalafshehab-crypto@gmail\.com["']/g, '');

    // Pattern for firestore.rules
    content = content.replace(/\s*\|\|\s*request\.auth\.token\.email\s*==\s*['"]khalafshehab-crypto@gmail\.com['"]/g, '');

    if (content !== fs.readFileSync(file, 'utf-8')) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
        modifiedCount++;
    }
}
console.log(`Total modified files: ${modifiedCount}`);
