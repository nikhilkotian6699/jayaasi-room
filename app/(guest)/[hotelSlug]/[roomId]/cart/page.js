'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import HomeView from '@/components/home/Home';

export default function CartRedirectPage() {
  const { openCart } = useApp();

  useEffect(() => {
    openCart();
  }, [openCart]);

  return <HomeView />;
}
