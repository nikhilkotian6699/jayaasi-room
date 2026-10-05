'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function BottomNavigation() {
  const pathname = usePathname() || '/';
  const { openCart, cartItemCount } = useApp();

  const isStore = pathname === '/store';
  const isTravel = pathname === '/travel';
  const isHome = pathname === '/' || pathname.endsWith('/204') || (!isStore && !isTravel && !pathname.includes('/room') && !pathname.includes('/services') && !pathname.includes('/cab'));
  const isRoomInfo = pathname === '/room' || pathname.includes('/room-info');

  return (
    <div className="gf-dock-wrapper">
      <div className="gf-bottom-sheet">
        <nav className="gf-dock" aria-label="Main Navigation">
          {/* 1. Jayaasi Store */}
          <Link
            href="/store"
            className={`gf-dock-item ${isStore ? 'gf-dock-active' : ''}`}
            title="Jayaasi Store"
          >
            <span className="gf-dock-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span className="gf-dock-label">Jayaasi Store</span>
          </Link>

          <div className="gf-dock-sep" />

          {/* 2. Travel Places */}
          <Link
            href="/travel"
            className={`gf-dock-item ${isTravel ? 'gf-dock-active' : ''}`}
            title="Travel Places"
          >
            <span className="gf-dock-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </span>
            <span className="gf-dock-label">Travel Places</span>
          </Link>

          <div className="gf-dock-sep" />

          {/* 3. Home (Active center button) */}
          <Link
            href="/"
            className={`gf-dock-item gf-dock-home ${isHome ? 'gf-dock-home-active' : ''}`}
            title="Home"
          >
            <span className="gf-dock-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 3L2 12h3.5v8h5v-5h3v5h5v-8h3.5L12 3z"/>
                <path d="M17 5.5h2v4l-2-1.7V5.5z"/>
              </svg>
            </span>
            <span className="gf-dock-label">Home</span>
          </Link>

          <div className="gf-dock-sep" />

          {/* 4. Room Info */}
          <Link
            href="/room"
            className={`gf-dock-item ${isRoomInfo ? 'gf-dock-active' : ''}`}
            title="Room info"
          >
            <span className="gf-dock-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <circle cx="12" cy="12" r="9"/>
                <line x1="12" y1="7.8" x2="12" y2="7.81" strokeWidth="3" strokeLinecap="round"/>
                <line x1="12" y1="10.8" x2="12" y2="16.2" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="gf-dock-label">Room info</span>
          </Link>

          <div className="gf-dock-sep" />

          {/* 5. Cart Button (Bottom sheet trigger) */}
          <button
            type="button"
            className="gf-dock-item"
            onClick={openCart}
            title="Cart"
            style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <span className="gf-dock-icon" style={{ position: 'relative' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartItemCount > 0 && (
                <span className="gf-cart-count-badge">
                  {cartItemCount}
                </span>
              )}
            </span>
            <span className="gf-dock-label">Cart</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
