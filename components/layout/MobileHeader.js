'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function MobileHeader({
  brandName = 'Jayaasi Room',
  brandSubtitle = 'Business Suite',
  hotelName = 'Hotel name',
  pageTitle = null,
  showBack = false,
  backHref = null,
}) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { room, hotel, isAuthenticated, openAuthModal, logout, showToast, openCart, cartItemCount } = useApp();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLang, setSelectedLang] = useState('EN');

  const languages = [
    { code: 'EN', name: 'English (US)' },
    { code: 'HI', name: 'हिंदी (Hindi)' },
    { code: 'AR', name: 'العربية (Arabic)' },
    { code: 'FR', name: 'Français (French)' },
    { code: 'DE', name: 'Deutsch (German)' },
    { code: 'JA', name: '日本語 (Japanese)' },
  ];

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <>
      <header className="gh-header-wrapper">
        {/* Top maroon brand bar */}
        <div className="gh-brand-bar">
          {showBack && (
            <button
              type="button"
              className="gh-header-back-btn"
              onClick={handleBack}
              aria-label="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Brand text left */}
          <Link href="/" className="gh-brand-text" style={{ textDecoration: 'none' }}>
            <span className="gh-brand-name">{brandName}</span>
            <span className="gh-brand-subtitle">
              {room?.number ? `Suite ${room.number} · ${room.name}` : brandSubtitle}
            </span>
          </Link>

          {/* Desktop Navigation (Visible on tablet & desktop >= 768px) */}
          <nav className="gh-desktop-nav" aria-label="Desktop Primary Navigation">
            <Link href="/" className={`gh-desk-link ${pathname === '/' ? 'gh-desk-link-active' : ''}`}>
              Home
            </Link>
            <Link href="/services" className={`gh-desk-link ${pathname.startsWith('/services') || pathname === '/cab' ? 'gh-desk-link-active' : ''}`}>
              Services
            </Link>
            <Link href="/room" className={`gh-desk-link ${pathname === '/room' ? 'gh-desk-link-active' : ''}`}>
              Room Info
            </Link>
            <Link href="/store" className={`gh-desk-link ${pathname === '/store' ? 'gh-desk-link-active' : ''}`}>
              Jayaasi Store
            </Link>
            <Link href="/travel" className={`gh-desk-link ${pathname === '/travel' ? 'gh-desk-link-active' : ''}`}>
              Travel Places
            </Link>
            <Link href="/admin/requests" className="gh-desk-link" style={{ color: '#fed7aa', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '12px' }}>
              Admin PMS ↗
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="gh-header-actions">
            {/* Desktop Cart Button */}
            <button
              type="button"
              className="gh-desk-cart-btn"
              onClick={openCart}
              aria-label="View Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="gh-desk-cart-badge">{cartItemCount}</span>
              )}
            </button>

            {/* Center avatar button */}
            <button
              type="button"
              className="gh-avatar-btn"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal();
                } else {
                  setActiveModal('profile');
                }
              }}
              aria-label="Guest Profile"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="7.2" r="3.8"/>
                <path d="M4.5 19.5c0-4 3.3-6.5 7.5-6.5s7.5 2.5 7.5 6.5"/>
              </svg>
            </button>

            {/* Vertical divider */}
            <div className="gh-divider" />

            {/* Language button */}
            <button
              type="button"
              className="gh-lang-btn"
              onClick={() => setActiveModal('lang')}
              aria-label="Select Language"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <text x="7" y="13.5" fontSize="11" fontWeight="700" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">文</text>
                <text x="14" y="19.5" fontSize="9" fontWeight="800" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">A</text>
              </svg>
            </button>
          </div>
        </div>

        {/* Sub-bar: Hotel name slanted tab + center title + telephone phone button */}
        <div className={`gh-sub-bar ${pageTitle ? 'gh-sub-bar--with-title' : ''}`}>
          <div className="gh-hotel-name-tab">
            <span className="gh-hotel-name-text">{hotelName}</span>
          </div>

          {pageTitle && (
            <div className="gh-subbar-title">
              {pageTitle}
            </div>
          )}

          <button
            type="button"
            className="gh-call-btn"
            onClick={() => setActiveModal('call')}
            aria-label="Call Reception"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#111111">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Spacer to push content below fixed header */}
      <div className="gh-header-spacer" aria-hidden="true" />

      {/* ─── MODAL: Call Hotel Reception ─── */}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#7a0c24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </a>
              <a href="tel:101" className="guest-call-item">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Housekeeping & Linen</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Dial Ext: 101 · Extra towels & cleaning</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a0c24" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </a>
              <a href="tel:102" className="guest-call-item">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>In-Room Dining Kitchen</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Dial Ext: 102 · Chef & Bar orders</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a0c24" strokeWidth="2">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
              </a>
              <a href="tel:9" className="guest-call-item" style={{ background: '#fdf2f2', borderColor: '#f8d7da' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#b91c1c' }}>Duty Manager / Emergency</div>
                  <div style={{ fontSize: '11px', color: '#b91c1c' }}>Dial Ext: 9 · Urgent support</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#b91c1c">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Select Language ─── */}
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

      {/* ─── MODAL: Guest Stay Info ─── */}
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
                {room.guest}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {room.type} · Floor {room.floor}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Wi-Fi Network</span>
                <span style={{ fontWeight: '700' }}>{room.wifiNetwork}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Wi-Fi Password</span>
                <span style={{ fontWeight: '700', color: 'var(--guest-maroon)' }}>{room.wifiPassword}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Check-out Time</span>
                <span style={{ fontWeight: '700' }}>{room.checkOut}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  logout();
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Log Out
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: 'var(--guest-maroon)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
