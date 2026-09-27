'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';
import { nearbyPlaces, cabProviders } from '@/lib/mock-data';

export default function GuestTravelPage() {
  const baseUrl = '/jayaasi-rooms/204';
  const [selectedCabType, setSelectedCabType] = useState('airport');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const cabOptions = [
    { id: 'airport', name: 'Airport Pickup / Drop', price: '₹750', time: '10 mins away', desc: 'Pune Int’l Airport (PNQ) • Sedan AC', icon: '✈️' },
    { id: 'city', name: 'City Ride (On Demand)', price: '₹350', time: '5 mins away', desc: 'Local travel within Pune city', icon: '🚕' },
    { id: 'hourly', name: 'Hourly Chauffeur Hire', price: '₹1,400', time: '4 hrs / 40 km', desc: 'Executive luxury sedan with driver', icon: '🚘' },
    { id: 'station', name: 'Railway Station Drop', price: '₹450', time: '8 mins away', desc: 'Pune Junction Railway Station', icon: '🚂' },
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

      {/* Main Body */}
      <main className="guest-main-body">
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '4px 0 16px',
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px', margin: 0 }}>
              Cab Services & Travel
            </h1>
            <p style={{ fontSize: '11px', color: '#6d7280', margin: '2px 0 0' }}>
              Doorstep pickup arranged from hotel lobby
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

        {/* Cab Booking Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid #e9ecef',
          boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
          marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a' }}>Select Ride Type</span>
            <span style={{ fontSize: '10px', color: 'var(--guest-maroon)', fontWeight: '700' }}>Hotel Lobby Pickup</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cabOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedCabType(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '14px',
                  border: selectedCabType === opt.id ? '1.5px solid var(--guest-maroon)' : '1px solid #edf0f3',
                  background: selectedCabType === opt.id ? '#fdf4f6' : '#fafafb',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#222' }}>{opt.name}</div>
                    <div style={{ fontSize: '10px', color: '#777', marginTop: '1px' }}>{opt.desc}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--guest-maroon)' }}>{opt.price}</div>
                  <div style={{ fontSize: '9px', color: '#888' }}>{opt.time}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => showToast('Cab booking requested! Concierge will confirm at lobby.')}
            style={{
              width: '100%',
              marginTop: '14px',
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
            Confirm Cab Booking
          </button>
        </div>

        {/* Nearby Places */}
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 10px' }}>
            Recommended Nearby Places
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {nearbyPlaces.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#f5f6f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    {p.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#222' }}>{p.name}</div>
                    <div style={{ fontSize: '10px', color: '#777', marginTop: '1px' }}>{p.category}</div>
                  </div>
                </div>

                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'var(--guest-maroon)',
                  background: '#fdf3f5',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}>
                  {p.distance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Shared Luxury Footer with Travel Active */}
      <GuestFooter activeTab="travel" />
    </div>
  );
}
