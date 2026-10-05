'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import HomeView from '@/components/home/Home';

export default function LoginRedirectPage() {
  const { openAuthModal } = useApp();

  useEffect(() => {
    openAuthModal();
  }, [openAuthModal]);

  return <HomeView />;
}
