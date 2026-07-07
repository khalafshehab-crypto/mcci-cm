const fs = require('fs');

function patch(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // For meetings:
    content = content.replace(/list\.sort\(\(a, b\) => a\.dateObj\.getTime\(\) - b\.dateObj\.getTime\(\)\);\n    return list;/, 'const uniqueList = Array.from(new Map(list.map(a => [a.id, a])).values());\n    uniqueList.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());\n    return uniqueList;');

    fs.writeFileSync(filePath, content);
    console.log("Patched", filePath);
}

patch('src/pages/CommitteesHome.tsx');
patch('src/pages/Home.tsx');
