import React, { useState } from 'react';
import { getSharedAccessToken, triggerAuthModal } from '../lib/googleApi';
import { Upload } from 'lucide-react';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GooglePickerButtonProps {
  onPick: (url: string, name: string) => void;
  className?: string;
  label?: string;
  viewId?: 'DOCS' | 'FOLDERS';
  children?: React.ReactNode;
}

export function GooglePickerButton({ onPick, className = "", label = "إرفاق من درايف", viewId = 'DOCS', children }: GooglePickerButtonProps) {
  const [isPicking, setIsPicking] = useState(false);

  const openPicker = async () => {
    try {
      setIsPicking(true);
      let token = await getSharedAccessToken();
      if (!token) {
        token = await triggerAuthModal();
        if (!token) {
          setIsPicking(false);
          return;
        }
      }

      // Load Picker API
      window.gapi.load('picker', {
        callback: () => {
          const pickerOrigin =
            window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
              ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
              : window.location.origin;

          const view = viewId === 'FOLDERS' 
            ? new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS).setSelectFolderEnabled(true)
            : new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);

          const uploadView = new window.google.picker.DocsUploadView();

          const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .addView(uploadView)
            .setOAuthToken(token)
            .setCallback((data: any) => {
              if (data.action === window.google.picker.Action.PICKED) {
                const file = data.docs[0];
                onPick(file.url, file.name);
              }
              if (data.action === window.google.picker.Action.CANCEL || data.action === window.google.picker.Action.PICKED) {
                setIsPicking(false);
              }
            })
            .setOrigin(pickerOrigin)
            .build();
          
          picker.setVisible(true);
        }
      });
    } catch (e) {
      console.error(e);
      setIsPicking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={openPicker}
      disabled={isPicking}
      className={children ? className : `flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors ${className}`}
    >
      {children ? children : (
        <>
          <Upload className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
