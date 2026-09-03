const req = { id: 'req1', name: 'Test', email: 'test@test.com', phone: '123' };
const disabledEmp = { id: '8583', email: 'test@test.com', photo: 'photo.jpg', committees: [] };
const emailLower = 'test@test.com';
let parsedId = "8583";
const payload = {
  name: req.name,
  role: "SPECIALIST",
  roleAr: "أخصائي اللجان",
  jobTitle: "أخصائي",
  orgLevel1: "الأمانة العامة",
  phone: req.phone || "",
  email: emailLower,
  photo: disabledEmp?.photo || "default",
  committees: disabledEmp?.committees || [],
  active: true,
  joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
  gender: req.gender || "MALE",
  isProfileComplete: false
};
console.log(payload);
