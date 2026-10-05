'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function RoomInformation() {
  const { room, hotel, showToast, openCart, cartItemCount } = useApp();
  const [copiedWifi, setCopiedWifi] = useState(false);

  const handleCopyWifi = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(room.wifiPassword);
        setCopiedWifi(true);
        showToast('Wi-Fi Password copied to clipboard!');
        setTimeout(() => setCopiedWifi(false), 2000);
      } else {
        throw new Error('Clipboard API unavailable in this context');
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      showToast(`Wi-Fi Password: ${room.wifiPassword}`);
    }
  };

  const amenities = [
    { name: 'Ultra High-Speed Wi-Fi', icon: '📶', desc: 'Complimentary 500 Mbps fiber' },
    { name: 'Executive Workstation', icon: '💼', desc: 'Ergonomic chair, USB-C desk ports' },
    { name: 'King Size Luxury Bed', icon: '🛏', desc: '400-thread count Egyptian cotton' },
    { name: 'Climate Control', icon: '❄️', desc: 'Smart dual-zone thermostat' },
    { name: '55" 4K Smart TV', icon: '📺', desc: 'AirPlay, Netflix & satellite channels' },
    { name: 'Gourmet Mini Bar & Nespresso', icon: '☕', desc: 'Refilled daily by room attendant' },
    { name: 'Electronic Lap Safe', icon: '🔒', desc: 'Accommodates up to 17" laptops' },
    { name: 'Spa Marble Bathroom', icon: '🛁', desc: 'Rain shower & Ayurvedic bath kit' },
  ];

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="Room Information" showBack backHref="/" />

      <main style={{ padding: '14px 16px 80px' }}>
        {/* Room Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #18191b 0%, #302024 100%)',
          color: '#ffffff',
          borderRadius: '22px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(135,15,43,0.4) 0%, transparent 70%)',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#e5b869', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {hotel.fullName}
              </span>
              <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 2px', letterSpacing: '-0.3px' }}>
                Room {room.number}
              </h1>
              <p style={{ fontSize: '14px', color: '#f5c46b', margin: 0, fontFamily: 'Dancing Script, cursive', fontWeight: '700' }}>
                {room.type}
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '11.5px',
              fontWeight: '700',
              color: '#4ade80',
              border: '1px solid rgba(74,222,128,0.3)',
            }}>
              ● Occupied
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '10.5px' }}>Registered Guest</span>
              <strong style={{ color: '#ffffff', fontSize: '13px' }}>{room.guest}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '10.5px' }}>Check-out</span>
              <strong style={{ color: '#ffffff', fontSize: '13px' }}>Today · {room.checkOut}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '10.5px' }}>Floor</span>
              <strong style={{ color: '#ffffff', fontSize: '13px' }}>Floor {room.floor}</strong>
            </div>
          </div>
        </div>

        {/* Wi-Fi Access Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '16px',
          margin: '14px 0',
          border: '1px solid #f1f1f4',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                📶
              </div>
              <div>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#18181b', display: 'block' }}>
                  Suite Wi-Fi Access
                </span>
                <span style={{ fontSize: '11px', color: '#71717a' }}>Network: <strong>{room.wifiNetwork}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyWifi}
              style={{
                background: copiedWifi ? '#16a34a' : '#870f2b',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                padding: '7px 14px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              {copiedWifi ? 'Copied! ✓' : 'Copy Password'}
            </button>
          </div>
        </div>

        {/* Quick Room Service Shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <Link
            href="/services/food"
            style={{
              background: '#ffffff',
              padding: '14px',
              borderRadius: '16px',
              border: '1px solid #f1f1f4',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🍽
            </div>
            <div>
              <strong style={{ fontSize: '12.5px', color: '#18181b', display: 'block' }}>Order Food</strong>
              <small style={{ fontSize: '10.5px', color: '#71717a' }}>Chef dining to 204</small>
            </div>
          </Link>

          <Link
            href="/services/housekeeping"
            style={{
              background: '#ffffff',
              padding: '14px',
              borderRadius: '16px',
              border: '1px solid #f1f1f4',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🧹
            </div>
            <div>
              <strong style={{ fontSize: '12.5px', color: '#18181b', display: 'block' }}>Housekeeping</strong>
              <small style={{ fontSize: '10.5px', color: '#71717a' }}>Fresh linen & refill</small>
            </div>
          </Link>
        </div>

        {/* Suite Amenities */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid #f1f1f4',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#18181b', margin: '0 0 12px' }}>
            Business Suite Features & Amenities
          </h2>

          <div className="room-amenities-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {amenities.map((item) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 10px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Cart Button */}
        <div style={{ position: 'fixed', right: '16px', bottom: '86px', zIndex: 900 }}>
          <button
            type="button"
            className="gh-cart-btn"
            onClick={openCart}
            aria-label="Cart"
            style={{ position: 'relative', border: 'none', cursor: 'pointer' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span className="gh-cart-label">cart</span>
            {cartItemCount > 0 && (
              <span className="gf-cart-count-badge" style={{ top: '-4px', right: '-4px' }}>
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </main>
    </>
  );
}
