'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import BottomNavigation from './BottomNavigation';
import ServiceCartBottomSheet from '../cart/ServiceCartBottomSheet';
import AuthModal from '../auth/AuthModal';

function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#7a0c24',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      zIndex: 99999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      pointerEvents: 'none'
    }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbf00', display: 'inline-block' }}></span>
      Offline — Connecting to Room Network...
    </div>
  );
}

function ToastBanner() {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;

  return (
    <div className="global-toast-notification">
      {toastMessage}
    </div>
  );
}

export default function GuestAppShell({ children }) {
  return (
    <div className="guest-shell">
      <OfflineIndicator />
      <ToastBanner />
      {children}
      <BottomNavigation />
      <ServiceCartBottomSheet />
      <AuthModal />
    </div>
  );
}
