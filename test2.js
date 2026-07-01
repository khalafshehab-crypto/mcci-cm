const emp1 = { orgLevel2: 'قطاع اللجان', orgLevel5: 'أخصائي' };
const emp2 = { orgLevel4: 'قسم اللجان', orgLevel5: 'أخصائي' };
const emp3 = { orgLevel4: 'قسم اللجان', orgLevel5: 'مطور واجهات' };

const calc = (emp) => {
    if (emp.orgLevel5) {
      // Check if it's STAFF... skipped for this test
      if (emp.orgLevel5 === 'أخصائي' || emp.orgLevel5 === 'أخصائي اللجان') {
         if (emp.orgLevel4) return `أخصائي ${emp.orgLevel4}`.trim();
      } else {
         return emp.orgLevel5.trim();
      }
    }
    
    if (emp.orgLevel4) return `رئيس ${emp.orgLevel4}`;
    if (emp.orgLevel3) return `مدير ${emp.orgLevel3}`;
    if (emp.orgLevel2) return `مساعد الأمين العام لـ ${emp.orgLevel2}`;
    if (emp.orgLevel1) return `الأمانة العامة`;
    return "غير مسكن";
};

console.log(calc(emp1)); // مساعد الأمين العام لـ قطاع اللجان
console.log(calc(emp2)); // أخصائي قسم اللجان
console.log(calc(emp3)); // مطور واجهات
