import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dump() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    getDocs(collection(db, "recommendations")).then(snap => {
      setData(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    });
  }, []);
  return <pre className="p-10">{JSON.stringify(data, null, 2)}</pre>;
}
