const arr = ["الدوري الثالث", "الدوري الثاني", "الدوري الأول التأسيسي"];
arr.sort((a,b) => a.localeCompare(b, 'ar'));
console.log(arr);
