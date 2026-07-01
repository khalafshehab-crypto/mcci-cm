import React, { useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function PresenceTracker() {
  useEffect(() => {
    let lastActiveUpdate = 0;
    
    const updatePresence = async () => {
      const now = Date.now();
      // Update at most once every 5 minutes
      if (now - lastActiveUpdate < 5 * 60 * 1000) return;
      
      try {
        const stored = localStorage.getItem("current_user");
        if (!stored) return;
        
        const user = JSON.parse(stored);
        if (!user || !user.id) return;
        
        const empRef = doc(db, 'employees', user.id);
        await updateDoc(empRef, {
          lastActive: now
        });
        
        lastActiveUpdate = now;
      } catch (e) {
        console.warn("Could not update presence", e);
      }
    };
    
    updatePresence();
    
    const onActivity = () => {
      updatePresence();
    };

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('scroll', onActivity);

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('scroll', onActivity);
    };
  }, []);

  return null;
}
