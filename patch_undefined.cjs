const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

const docFind = `      const newDoc = {
        title: subjectName,
        description: isCircular ? \`مجلد تعاميم | لجان: \${combinedCommitteesName} | موضوع: \${circularSubject || ""}\` : \`مجلد خطابات - مجلد مسودات | لجان: \${combinedCommitteesName} | صادر إلى: \${aiGenRecipientName}\`,
        type: finalType,
        creator: creatorName,
        cloudUrl: lastCloudUrl, // For download button
        downloadUrl: lastCloudUrl, // For download button
        lastUpdated: new Date().toISOString().split('T')[0],
        isFavorite: false,
        templateText: lastTemplateText,
        committeeId: targetCommittees[0].id || "", // legacy
        targetCommitteesList: targetCommittees.map(c => ({id: c.id, name: c.name})),
        committeeUrls: committeeUrls,
        attachments: urlAttachments,
        circularDetails: isCircular ? {
            outNumber: circularOutNumber,
            outDate: circularOutDate,
            incomingFrom: circularIncomingFrom,
            incomingNumber: circularIncomingNumber,
            incomingDate: circularIncomingDate,
            subject: circularSubject,
            contactName: circularContactName,
            contactPhone: circularContactPhone,
            contactEmail: circularContactEmail,
            distributionMethod: (circularViaEmail && circularViaWhatsApp) ? "البريد الإلكتروني والواتس آب" : circularViaEmail ? "البريد الإلكتروني" : circularViaWhatsApp ? "الواتس آب" : "غير محدد",
            body: aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText,
        } : null
      };`;
const docReplace = `      const sanitize = (val) => val === undefined ? "" : val;
      const newDoc = {
        title: sanitize(subjectName),
        description: sanitize(isCircular ? \`مجلد تعاميم | لجان: \${combinedCommitteesName} | موضوع: \${circularSubject || ""}\` : \`مجلد خطابات - مجلد مسودات | لجان: \${combinedCommitteesName} | صادر إلى: \${aiGenRecipientName}\`),
        type: sanitize(finalType),
        creator: sanitize(currentUser?.name || "الأخصائي"),
        cloudUrl: sanitize(lastCloudUrl), // For download button
        downloadUrl: sanitize(lastCloudUrl), // For download button
        lastUpdated: new Date().toISOString().split('T')[0],
        isFavorite: false,
        templateText: sanitize(lastTemplateText),
        committeeId: sanitize(targetCommittees[0]?.id || ""), // legacy
        targetCommitteesList: targetCommittees.map(c => ({id: sanitize(c.id), name: sanitize(c.name)})),
        committeeUrls: committeeUrls.map(cu => ({
            committeeId: sanitize(cu.committeeId),
            committeeName: sanitize(cu.committeeName),
            documentUrl: sanitize(cu.documentUrl),
            folderUrl: sanitize(cu.folderUrl)
        })),
        attachments: urlAttachments,
        circularDetails: isCircular ? {
            outNumber: sanitize(circularOutNumber),
            outDate: sanitize(circularOutDate),
            incomingFrom: sanitize(circularIncomingFrom),
            incomingNumber: sanitize(circularIncomingNumber),
            incomingDate: sanitize(circularIncomingDate),
            subject: sanitize(circularSubject),
            contactName: sanitize(circularContactName),
            contactPhone: sanitize(circularContactPhone),
            contactEmail: sanitize(circularContactEmail),
            distributionMethod: sanitize((circularViaEmail && circularViaWhatsApp) ? "البريد الإلكتروني والواتس آب" : circularViaEmail ? "البريد الإلكتروني" : circularViaWhatsApp ? "الواتس آب" : "غير محدد"),
            body: sanitize(aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText),
        } : null
      };`;

if (code.includes('title: subjectName,')) {
    code = code.replace(docFind, docReplace);
    fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
    console.log("Patched undefined sanitization.");
} else {
    console.log("Could not find block.");
}
