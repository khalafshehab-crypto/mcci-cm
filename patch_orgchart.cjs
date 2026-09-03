const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

// 1. Add state for serverJoinRequests
const oldState = `const { data: dbJoinRequests, deleteDocument: deleteFirebaseReq } = useFirestoreCollection<JoinRequest>("join_requests", []);`;
const newState = `const [serverJoinRequests, setServerJoinRequests] = useState<JoinRequest[]>([]);
  useEffect(() => {
    fetch('/api/join-requests')
      .then(r => r.json())
      .then(data => setServerJoinRequests(data))
      .catch(e => console.error(e));
  }, []);`;
code = code.replace(oldState, newState);

// 2. Modify approveJoinRequest
const oldApprove = `await deleteFirebaseReq(req.id);`;
const newApprove = `await fetch(\`/api/join-requests/\${req.id}\`, { method: 'DELETE' });
    setServerJoinRequests(prev => prev.filter(x => x.id !== req.id));`;
code = code.replace(oldApprove, newApprove);

// 3. Modify rejectJoinRequest
const oldReject = `await deleteFirebaseReq(req.id);`;
const newReject = `await fetch(\`/api/join-requests/\${req.id}\`, { method: 'DELETE' });
    setServerJoinRequests(prev => prev.filter(x => x.id !== req.id));`;
code = code.replace(oldReject, newReject);

// 4. Update the render loop to use serverJoinRequests
const oldRender = `{dbJoinRequests.filter(req => !req.status || req.status === "pending").map((req) => (`
const newRender = `{serverJoinRequests.filter(req => !req.status || req.status === "pending").map((req) => (`
code = code.replace(oldRender, newRender);

const oldEmpty = `dbJoinRequests.filter(req => !req.status || req.status === "pending").length === 0`
const newEmpty = `serverJoinRequests.filter(req => !req.status || req.status === "pending").length === 0`
code = code.replace(oldEmpty, newEmpty);

const oldBadge = `{dbJoinRequests.filter(req => !req.status || req.status === "pending").length}`
const newBadge = `{serverJoinRequests.filter(req => !req.status || req.status === "pending").length}`
code = code.replace(oldBadge, newBadge);

// 5. Update verifyJoinRequestsIntegrity
const oldVerify = `  const verifyJoinRequestsIntegrity = async () => {
    try {
      if (isUseMock()) {
         toast.error("النظام يعمل حالياً في وضع الذاكرة المحلية (Offline) بسبب مشكلة في الاتصال أو صلاحيات الكلاود.");
         return;
      }

      const q = query(collection(db, "join_requests"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      
      toast.success(\`اكتمل الفحص: يوجد \${snap.size} طلب انضمام معلق في قاعدة البيانات الحقيقية.\`);
      snap.forEach(doc => console.log("Join Req:", doc.id, doc.data()));
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Missing or insufficient permissions")) {
        toast.error("فشل الاستعلام: الجدار الناري (Firestore Rules) يمنع قراءة الطلبات. يرجى تحديث القواعد من لوحة تحكم Firebase.");
      } else {
        toast.error("فشل الاستعلام بسبب خطأ غير متوقع.");
      }
    }
  };`;
const newVerify = `  const verifyJoinRequestsIntegrity = async () => {
    try {
      const res = await fetch('/api/join-requests');
      const data = await res.json();
      const pending = data.filter((x: any) => !x.status || x.status === "pending");
      toast.success(\`اكتمل الفحص: يوجد \${pending.length} طلب انضمام معلق في الخادم الداخلي للمنصة.\`);
    } catch (err: any) {
      toast.error("فشل الاستعلام من الخادم الداخلي.");
    }
  };`;
code = code.replace(oldVerify, newVerify);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
console.log("Updated OrgChart.tsx");
