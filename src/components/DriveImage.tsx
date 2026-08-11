import React, { useState, useEffect } from 'react';
import { getSharedAccessToken } from '../lib/googleApi';

interface DriveImageProps {
  fileId: string;
  className?: string;
  fallbackInitials?: string;
  fallbackClassName?: string;
}

export const DriveImage: React.FC<DriveImageProps> = ({ fileId, className, fallbackInitials, fallbackClassName }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const loadImg = async () => {
      try {
        const token = await getSharedAccessToken();
        if (!token) {
          setFailed(true);
          return;
        }
        
        if (active) {
          setSrc(`/api/drive-file/${fileId}?token=${token}`);
        }
      } catch (err) {
        if (active) setFailed(true);
      }
    };
    
    loadImg();
    
    return () => {
      active = false;
    };
  }, [fileId]);

  if (failed || !src) {
    return (
      <div className={fallbackClassName || className}>
        {fallbackInitials}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      className={className} 
      referrerPolicy="no-referrer"
      alt="User"
      onError={() => setFailed(true)}
    />
  );
};
