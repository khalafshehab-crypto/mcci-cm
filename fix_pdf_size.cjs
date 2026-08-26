const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

// 1. Update import
code = code.replace("import { toPng } from 'html-to-image';", "import { toJpeg, toPng } from 'html-to-image';");

// 2. Find the getPdfBlob function and replace toPng with toJpeg and add quality
const originalToPng = `const dataUrl = await toPng(el, { 
        cacheBust: true, 
        backgroundColor: '#FFFFFF', 
        pixelRatio: 3,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });`;

const optimizedToJpeg = `const dataUrl = await toJpeg(el, { 
        cacheBust: true, 
        backgroundColor: '#FFFFFF', 
        pixelRatio: 1.5,
        quality: 0.85,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });`;

code = code.replace(originalToPng, optimizedToJpeg);

// 3. Update jsPDF addImage to use JPEG
code = code.replace("pdf.addImage(dataUrl, 'PNG', 0, yOffset, pdfWidth, pdfHeight);", "pdf.addImage(dataUrl, 'JPEG', 0, yOffset, pdfWidth, pdfHeight);");

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("PDF generation size optimization applied.");
