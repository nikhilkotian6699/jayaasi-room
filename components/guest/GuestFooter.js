'use client';

import { useState } from 'react';
import Link from 'next/link';
import { rooms } from '@/lib/mock-data';

export default function GuestFooter({ activeTab = 'home' }) {
  const baseUrl = '/jayaasi-rooms/204';
  const room = rooms.find(r => r.number === '204') || rooms[0];
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const storeItems = [
    { id: 'st_1', name: 'Executive Leather Laptop Sleeve', price: '₹1,850', tag: 'Bestseller' },
    { id: 'st_2', name: 'Universal International Travel Adaptor', price: '₹950', tag: 'Essential' },
    { id: 'st_3', name: 'Luxury Mulberry Silk Sleep Mask', price: '₹750', tag: 'Comfort' },
    { id: 'st_4', name: 'Artisanal Belgian Dark Chocolates Box', price: '₹1,200', tag: 'Gift Pack' },
  ];

  return (
    <>
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

      {/* ─── Floating Curved Dark Bottom Navigation Dock ─────────────── */}
      <div className="guest-bottom-dock-wrapper">
        {/* Arched dome protruding upwards in the center */}
        <div className="guest-dock-arch-dome">
          <Link href={`${baseUrl}/services`} className="guest-dock-services-circle" title="Hotel Services">
            <img 
              src="/images/services_circle_clean.png" 
              alt="Services" 
            />
          </Link>
        </div>

        <nav className="guest-bottom-dock">
          {/* Item 1: Jaayasi store */}
          <button 
            className={`guest-dock-item ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setIsStoreOpen(true)}
            title="Jaayasi Store"
          >
            <span className="guest-dock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l1-5h16l1 5"/>
                <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>
                <path d="M4 14v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6"/>
                <path d="M9 21v-5h6v5"/>
              </svg>
            </span>
            <span>Jaayasi store</span>
          </button>

          <div className="guest-dock-divider" />

          {/* Item 2: Travel places */}
          <Link 
            href={`${baseUrl}/travel`} 
            className={`guest-dock-item ${activeTab === 'travel' ? 'active' : ''}`} 
            title="Travel Places"
          >
            <span className="guest-dock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </span>
            <span>Travel places</span>
          </Link>

          <div className="guest-dock-divider" />

          {/* Item 3: Home */}
          <Link 
            href={baseUrl} 
            className={`guest-dock-item ${activeTab === 'home' ? 'active' : ''}`} 
            title="Home"
          >
            <span className="guest-dock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10.5L12 3l9 7.5"/>
                <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/>
                <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/>
              </svg>
            </span>
            <span>Home</span>
          </Link>

          <div className="guest-dock-divider" />

          {/* Item 4: Room info */}
          <Link 
            href={`${baseUrl}/room-info`} 
            className={`guest-dock-item ${activeTab === 'room-info' ? 'active' : ''}`} 
            title="Room Info"
          >
            <span className="guest-dock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
            </span>
            <span>Room info</span>
          </Link>

          <div className="guest-dock-divider" />

          {/* Item 5: Cart / Orders */}
          <Link 
            href={`${baseUrl}/orders`} 
            className={`guest-dock-item ${activeTab === 'cart' ? 'active' : ''}`} 
            title="Cart"
          >
            <span className="guest-dock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </span>
            <span>cart</span>
          </Link>
        </nav>
      </div>

      {/* ─── MODAL: Jayaasi Business Store ────────────────────────────── */}
      {isStoreOpen && (
        <div className="guest-modal-backdrop" onClick={() => setIsStoreOpen(false)}>
          <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-header">
              <div>
                <span className="guest-modal-title">Jayaasi Business Store</span>
                <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>
                  Delivered to Room {room.number} · Charge to Room Bill
                </div>
              </div>
              <button className="guest-modal-close" onClick={() => setIsStoreOpen(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {storeItems.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#f9f9fb',
                  borderRadius: '14px',
                  border: '1px solid #ebecee',
                }}>
                  <div>
                    <span style={{
                      fontSize: '9px',
                      background: 'rgba(122, 12, 36, 0.1)',
                      color: 'var(--guest-maroon)',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {item.tag}
                    </span>
                    <div style={{ fontWeight: '700', fontSize: '13px', marginTop: '4px' }}>{item.name}</div>
                    <div style={{ fontWeight: '800', color: 'var(--guest-maroon)', fontSize: '13px', marginTop: '2px' }}>
                      {item.price}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showToast(`Added "${item.name}" to your Room Bill request!`);
                      setIsStoreOpen(false);
                    }}
                    style={{
                      background: 'var(--guest-maroon)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '7px 14px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Add +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
