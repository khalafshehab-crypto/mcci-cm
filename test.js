const calculateDisplayJobTitle = (emp, nodes) => {
    if (emp.orgLevel5) {
        const node = nodes.find(n => n.name === emp.orgLevel5);
        if (node && node.type === 'STAFF') {
            return emp.orgLevel5;
        }
        return `أخصائي ${emp.orgLevel4 || emp.orgLevel5}`;
    } else if (emp.orgLevel4) {
        return `رئيس ${emp.orgLevel4}`;
    } else if (emp.orgLevel3) {
        return `مدير ${emp.orgLevel3}`;
    } else if (emp.orgLevel2) {
        return `مساعد الأمين العام لـ ${emp.orgLevel2}`;
    } else if (emp.orgLevel1) {
        return `الأمانة العامة`;
    }
    return emp.jobTitle || "غير مسكن";
};
