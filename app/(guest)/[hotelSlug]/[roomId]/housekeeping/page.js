'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';

export default function HousekeepingPage() {
  const baseUrl = '/jayaasi-rooms/204';
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const items = [
    { id: 'hk_1', icon: '🧹', name: 'Room Cleaning', desc: 'Full room cleaning service • 30 mins' },
    { id: 'hk_2', icon: '🛏', name: 'Bed Making', desc: 'Fresh bed linen & duvet change' },
    { id: 'hk_3', icon: '🚿', name: 'Bathroom Cleaning', desc: 'Deep bathroom sanitization & tiles' },
    { id: 'hk_4', icon: '🧴', name: 'Toiletries Replenishment', desc: 'Organic soap, shampoo, dental kit' },
    { id: 'hk_5', icon: '💧', name: 'Drinking Water Refill', desc: 'Two complimentary packaged glass bottles' },
    { id: 'hk_6', icon: '🗑', name: 'Garbage Removal', desc: 'Empty bedroom & bathroom waste bins' },
    { id: 'hk_7', icon: '🧺', name: 'Fresh Towel Set', desc: '2 Bath towels & 2 hand towels' },
    { id: 'hk_8', icon: '✨', name: 'On-request Cleaning', desc: 'Immediate priority spot cleaning' },
  ];

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '4px 0 16px',
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px', margin: 0 }}>
              Housekeeping Services
            </h1>
            <p style={{ fontSize: '11px', color: '#6d7280', margin: '2px 0 0' }}>
              Complimentary room services for Room 204
            </p>
          </div>

          <Link href={`${baseUrl}/services`} style={{
            fontSize: '11px',
            color: 'var(--guest-maroon)',
            fontWeight: '700',
            textDecoration: 'none',
            background: 'rgba(122, 12, 36, 0.08)',
            padding: '5px 12px',
            borderRadius: '999px',
          }}>
            ← Services
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '12px 14px',
                border: '1px solid #e9ecef',
                boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{item.desc}</div>
                </div>
              </div>

              <button
                onClick={() => showToast(`Requested "${item.name}"! Assigned to Floor 2 team.`)}
                style={{
                  background: 'var(--guest-maroon)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(122, 12, 36, 0.25)',
                }}
              >
                Request
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Shared Luxury Footer */}
      <GuestFooter activeTab="services" />
    </div>
  );
}
