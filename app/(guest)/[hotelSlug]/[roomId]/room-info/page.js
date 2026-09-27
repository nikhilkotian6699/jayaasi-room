'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';
import { hotel, rooms } from '@/lib/mock-data';

export default function RoomInfoPage() {
  const baseUrl = '/jayaasi-rooms/204';
  const room = rooms.find(r => r.number === '204') || rooms[0];
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyWifi = () => {
    navigator.clipboard?.writeText(hotel.wifiPassword);
    setCopied(true);
    showToast('Wi-Fi Password copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

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
        {/* Page Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '4px 0 16px',
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px', margin: 0 }}>
              Room Information
            </h1>
            <p style={{ fontSize: '11px', color: '#6d7280', margin: '2px 0 0' }}>
              Suite amenities, Wi-Fi access & hotel timings
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

        {/* Room Suite Card */}
        <div style={{
          background: 'linear-gradient(135deg, #7c0a20 0%, #9e1432 50%, #580415 100%)',
          borderRadius: '22px',
          padding: '18px',
          color: '#ffffff',
          marginBottom: '16px',
          boxShadow: '0 8px 24px rgba(122, 12, 36, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, fontWeight: '700' }}>
            Current Guest Stay
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 2px' }}>
            Room {room.number} · {room.type}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Primary Guest: {room.guest || 'Ananya Mehta'}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '16px',
            background: 'rgba(0,0,0,0.22)',
            padding: '10px',
            borderRadius: '14px',
            fontSize: '11px',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ opacity: 0.7, fontSize: '9px' }}>FLOOR</div>
              <div style={{ fontWeight: '800', marginTop: '2px' }}>{room.floor}nd Floor</div>
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: '9px' }}>BED TYPE</div>
              <div style={{ fontWeight: '800', marginTop: '2px' }}>{room.bedType}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: '9px' }}>CAPACITY</div>
              <div style={{ fontWeight: '800', marginTop: '2px' }}>{room.capacity} Guests</div>
            </div>
          </div>
        </div>

        {/* High-Speed Wi-Fi Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid #e9ecef',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: '#fdf3f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'var(--guest-maroon)',
            }}>
              📶
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a' }}>High-Speed Wi-Fi</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Network: <strong>{hotel.wifiName}</strong></div>
              <div style={{ fontSize: '11px', color: 'var(--guest-maroon)', marginTop: '1px' }}>Password: <strong>{hotel.wifiPassword}</strong></div>
            </div>
          </div>

          <button
            onClick={copyWifi}
            style={{
              background: copied ? '#23634a' : 'var(--guest-maroon)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 14px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(122, 12, 36, 0.25)',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Hotel Timings & Guidelines */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid #e9ecef',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
          marginBottom: '14px',
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 12px' }}>
            Hotel Timings & Guidelines
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f2f3f5' }}>
              <span style={{ color: '#666' }}>Check-in / Check-out</span>
              <span style={{ fontWeight: '700' }}>{hotel.checkIn} / {hotel.checkOut}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f2f3f5' }}>
              <span style={{ color: '#666' }}>In-Room Breakfast</span>
              <span style={{ fontWeight: '700' }}>07:00 AM – 10:30 AM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f2f3f5' }}>
              <span style={{ color: '#666' }}>Housekeeping Service</span>
              <span style={{ fontWeight: '700' }}>08:00 AM – 09:00 PM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Smoking Policy</span>
              <span style={{ fontWeight: '700', color: '#b91c1c' }}>100% Non-Smoking</span>
            </div>
          </div>
        </div>

        {/* Room Amenities Badges */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid #e9ecef',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 10px' }}>
            Room Amenities
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(room.amenities || ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Work Desk', 'Lounge']).map((am) => (
              <span key={am} style={{
                fontSize: '11px',
                fontWeight: '600',
                background: '#f6f7f9',
                color: '#2c313a',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid #e2e5eb',
              }}>
                ✓ {am}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Shared Luxury Footer with Room Info Active */}
      <GuestFooter activeTab="room-info" />
    </div>
  );
}
