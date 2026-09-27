'use client';

import { useState } from 'react';
import { hotel, rooms } from '@/lib/mock-data';

export default function GuestHeader({ hotelName = 'Hotel name', pageTitle = null }) {
  const room = rooms.find(r => r.number === '204') || rooms[0];
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const languages = [
    { code: 'EN', name: 'English (US)' },
    { code: 'HI', name: 'हिंदी (Hindi)' },
    { code: 'AR', name: 'العربية (Arabic)' },
    { code: 'FR', name: 'Français (French)' },
    { code: 'DE', name: 'Deutsch (German)' },
    { code: 'JA', name: '日本語 (Japanese)' },
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

      {/* ─── Top Luxury Header ────────────────────────────────────────── */}
      <header className="guest-header-wrapper">
        <div className="guest-header-banner">
          <img 
            src="/images/jayaasi_header_perfect.png" 
            alt="Jayaasi Room Business Suite - Hotel name"
            className="guest-header-img"
          />

          {/* Hotspot 1: Centered Profile Avatar */}
          <button 
            type="button"
            className="guest-hotspot-btn guest-hotspot-avatar"
            onClick={() => setActiveModal('profile')}
            aria-label="Guest Stay Profile"
            title="Room 204 Guest Profile"
          />

          {/* Hotspot 2: Language Selector (文A) */}
          <button 
            type="button"
            className="guest-hotspot-btn guest-hotspot-lang"
            onClick={() => setActiveModal('lang')}
            aria-label="Select Language"
            title="Select Language"
          />

          {/* Hotspot 3: Phone Reception Call Button */}
          <button 
            type="button"
            className="guest-hotspot-btn guest-hotspot-call"
            onClick={() => setActiveModal('call')}
            aria-label="Call Reception"
            title="Call Reception"
          />

          {/* Page Title in Center Gap between tabs (e.g. 'services') */}
          {pageTitle && (
            <div className="guest-header-page-title">
              {pageTitle}
            </div>
          )}

          {/* Optional: Dynamic hotel name badge if not default 'Hotel name' */}
          {hotelName && hotelName !== 'Hotel name' && (
            <div className="guest-header-custom-hotel-badge">
              {hotelName}
            </div>
          )}
        </div>
      </header>

      {/* ─── MODAL: Call Hotel Reception ─────────────────────────────── */}
      {activeModal === 'call' && (
        <div className="guest-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-header">
              <span className="guest-modal-title">Hotel Directory & Calls</span>
              <button className="guest-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="guest-call-list">
              <a href="tel:0" className="guest-call-item">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Front Desk / Reception</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Dial Ext: 0 · 24/7 Assistance</div>
                </div>
                <span style={{ fontSize: '20px' }}>📞</span>
              </a>
              <a href="tel:1" className="guest-call-item">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Housekeeping & Linen</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Dial Ext: 101 · Extra towels & cleaning</div>
                </div>
                <span style={{ fontSize: '20px' }}>🧹</span>
              </a>
              <a href="tel:2" className="guest-call-item">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>In-Room Dining Kitchen</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Dial Ext: 102 · Chef & Bar orders</div>
                </div>
                <span style={{ fontSize: '20px' }}>🍽️</span>
              </a>
              <a href="tel:9" className="guest-call-item" style={{ background: '#fdf2f2', borderColor: '#f8d7da' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#b91c1c' }}>Duty Manager / Emergency</div>
                  <div style={{ fontSize: '11px', color: '#b91c1c' }}>Dial Ext: 9 · Urgent support</div>
                </div>
                <span style={{ fontSize: '20px' }}>🚨</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Select Language ───────────────────────────────────── */}
      {activeModal === 'lang' && (
        <div className="guest-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-header">
              <span className="guest-modal-title">Choose Language</span>
              <button className="guest-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="guest-lang-grid">
              {languages.map((l) => (
                <div
                  key={l.code}
                  className={`guest-lang-option ${selectedLang === l.code ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLang(l.code);
                    setActiveModal(null);
                    showToast(`Language switched to ${l.name}`);
                  }}
                >
                  <span>{l.name}</span>
                  {selectedLang === l.code && <span>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Guest Room Details ─────────────────────────────────── */}
      {activeModal === 'profile' && (
        <div className="guest-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-header">
              <span className="guest-modal-title">Room {room.number} Stay Info</span>
              <button className="guest-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #fdf3f5 0%, #fbe8ec 100%)',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid #f2cbd3',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--guest-maroon)', fontWeight: '700', textTransform: 'uppercase' }}>
                Primary Guest
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#2b2326', marginTop: '4px' }}>
                {room.guest || 'Ananya Mehta'}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {room.type} · Floor {room.floor}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Wi-Fi Network</span>
                <span style={{ fontWeight: '700' }}>{hotel.wifiName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Wi-Fi Password</span>
                <span style={{ fontWeight: '700', color: 'var(--guest-maroon)' }}>{hotel.wifiPassword}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Check-out Time</span>
                <span style={{ fontWeight: '700' }}>{hotel.checkOut} AM</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                marginTop: '18px',
                padding: '12px',
                background: 'var(--guest-maroon)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
