'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';
import { menuItems, menuCategories } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

export default function GuestFoodPage() {
  const baseUrl = '/jayaasi-rooms/204';
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = activeCategory === 'All'
    ? menuItems.filter(m => m.available)
    : menuItems.filter(m => m.available && m.category === activeCategory);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`Added ${item.name} to in-room dining cart!`);
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <div className="guest-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#18191b',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '999px',
          zIndex: 999,
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Shared Luxury Header */}
      <GuestHeader hotelName="Hotel name" />

      {/* Main Content */}
      <main className="guest-main-body">
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '4px 0 14px',
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px', margin: 0 }}>
              Order Food & Dining
            </h1>
            <p style={{ fontSize: '11px', color: '#6d7280', margin: '2px 0 0' }}>
              Freshly prepared • In-room delivery in 25–35 mins
            </p>
          </div>

          <Link href={baseUrl} style={{
            fontSize: '11px',
            color: 'var(--guest-maroon)',
            fontWeight: '700',
            textDecoration: 'none',
            background: 'rgba(122, 12, 36, 0.08)',
            padding: '5px 12px',
            borderRadius: '999px',
          }}>
            ← Home
          </Link>
        </div>

        {/* Category Pills Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '14px',
          scrollbarWidth: 'none',
        }}>
          {['All', ...menuCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '700',
                border: activeCategory === cat ? 'none' : '1px solid #e2e5eb',
                background: activeCategory === cat ? 'var(--guest-maroon)' : '#ffffff',
                color: activeCategory === cat ? '#ffffff' : '#4b5563',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                boxShadow: activeCategory === cat ? '0 2px 8px rgba(122, 12, 36, 0.25)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '14px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '28px', lineHeight: 1 }}>{item.emoji}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a' }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      color: item.veg ? '#166534' : '#991b1b',
                      background: item.veg ? '#f0fdf4' : '#fef2f2',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      border: `1px solid ${item.veg ? '#bbf7d0' : '#fecaca'}`,
                    }}>
                      {item.veg ? '● VEG' : '▲ NON-VEG'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0', lineHeight: 1.3 }}>
                    {item.description}
                  </p>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--guest-maroon)', marginTop: '6px' }}>
                    {formatPrice(item.price)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => addToCart(item)}
                style={{
                  background: 'var(--guest-maroon)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '7px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(122, 12, 36, 0.25)',
                }}
              >
                Add +
              </button>
            </div>
          ))}
        </div>

        {/* Floating Cart Checkout Bar if items selected */}
        {cartCount > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '380px',
            background: 'linear-gradient(135deg, #7c0a20 0%, #580415 100%)',
            borderRadius: '20px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(122, 12, 36, 0.45)',
            zIndex: 90,
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800' }}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in Cart
              </div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Total: {formatPrice(cartTotal)}</div>
            </div>

            <Link
              href={`${baseUrl}/orders`}
              style={{
                background: '#ffffff',
                color: 'var(--guest-maroon)',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '800',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              View Order &gt;
            </Link>
          </div>
        )}
      </main>

      {/* Shared Luxury Footer */}
      <GuestFooter activeTab="services" />
    </div>
  );
}
