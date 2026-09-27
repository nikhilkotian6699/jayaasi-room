'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';

export default function LaundryPage() {
  const baseUrl = '/jayaasi-rooms/204';
  const [garments, setGarments] = useState(3);
  const [serviceType, setServiceType] = useState('Wash & Iron');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const services = [
    { name: 'Wash & Iron', price: '₹45 / pc', desc: 'Washed, dried & crisp steam ironed' },
    { name: 'Steam Ironing Only', price: '₹25 / pc', desc: 'Fast turnaround in 3 hours' },
    { name: 'Dry Cleaning', price: '₹120 / pc', desc: 'Suits, blazers, silk & delicate fabrics' },
    { name: 'Express Wash', price: '₹80 / pc', desc: 'Delivered back within 4 hours' },
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
              Laundry & Dry Cleaning
            </h1>
            <p style={{ fontSize: '11px', color: '#6d7280', margin: '2px 0 0' }}>
              Complimentary pickup from Room 204
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

        {/* Laundry Options */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid #e9ecef',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          marginBottom: '16px',
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 12px' }}>
            Select Service Type
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {services.map((s) => (
              <div
                key={s.name}
                onClick={() => setServiceType(s.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '14px',
                  border: serviceType === s.name ? '1.5px solid var(--guest-maroon)' : '1px solid #edf0f3',
                  background: serviceType === s.name ? '#fdf4f6' : '#fafafb',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#222' }}>{s.name}</div>
                  <div style={{ fontSize: '10px', color: '#777', marginTop: '1px' }}>{s.desc}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--guest-maroon)' }}>
                  {s.price}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>Approx. Pieces:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setGarments(Math.max(1, garments - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ fontSize: '14px', fontWeight: '800' }}>{garments}</span>
              <button
                onClick={() => setGarments(garments + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => showToast(`Pickup requested for ${garments} pieces (${serviceType})! Housekeeper en route.`)}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              background: 'linear-gradient(135deg, #870f2b 0%, #5d061a 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(122, 12, 36, 0.35)',
            }}
          >
            Request Laundry Pickup
          </button>
        </div>
      </main>

      {/* Shared Luxury Footer */}
      <GuestFooter activeTab="services" />
    </div>
  );
}
