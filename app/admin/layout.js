'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

const navItems = [
  { label: 'WORKSPACE', items: [
    { name: 'Overview', icon: '▦', href: '/admin' },
    { name: 'Requests', icon: '◷', href: '/admin/requests', badge: true },
    { name: 'Rooms', icon: '▤', href: '/admin/rooms' },
    { name: 'Services', icon: '✳', href: '/admin/services' },
    { name: 'Food Menu', icon: '♨', href: '/admin/menu' },
    { name: 'Travel & Places', icon: '⌖', href: '/admin/travel' },
  ]},
  { label: 'MANAGE', items: [
    { name: 'Staff & Access', icon: '♙', href: '/admin/staff' },
    { name: 'Analytics', icon: '▥', href: '/admin/analytics' },
    { name: 'QR Codes', icon: '⊞', href: '/admin/qr' },
    { name: 'Hotel Settings', icon: '⚙', href: '/admin/settings' },
  ]},
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const currentPage = navItems
    .flatMap(g => g.items)
    .find(item => isActive(item.href))?.name || 'Overview';

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandMark}>j<span>.</span></span>
          <span className={styles.brandCopy}>
            <strong>jayaasi</strong>
            <small>ROOM OPERATIONS</small>
          </span>
        </Link>

        <div className={styles.propertySwitcher}>
          <div className={styles.propertyAvatar}>JR</div>
          <div className={styles.propertyCopy}>
            <strong>Jayaasi Rooms</strong>
            <small>Business Suite · Pune</small>
          </div>
          <span className={styles.chevron}>⌄</span>
        </div>

        {navItems.map((group) => (
          <div key={group.label}>
            <div className={styles.navLabel}>{group.label}</div>
            <nav className={styles.navList}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.name}
                  {item.badge && <span className={styles.navBadge}>5</span>}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        <div className={styles.sidebarBottom}>
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>✦</div>
            <strong>Need a hand?</strong>
            <p>Our support team is here for you.</p>
            <button className={styles.helpButton}>Get support <span>↗</span></button>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>AK</div>
            <div className={styles.userCopy}>
              <strong>Arjun Kumar</strong>
              <small>Hotel administrator</small>
            </div>
            <button className={styles.moreButton}>···</button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.mobileMenu}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <div className={styles.breadcrumbs}>
            <span>Jayaasi Rooms</span>
            <b>/</b>
            <strong>{currentPage}</strong>
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.liveStatus}><i></i> Live</span>
            <button className={styles.iconButton}>⌕</button>
            <button className={`${styles.iconButton} ${styles.notificationButton}`}>
              🔔<i></i>
            </button>
            <div className={styles.topDivider}></div>
            <button className={styles.todayButton}>Today <span>⌄</span></button>
          </div>
        </header>

        <section className={styles.pageContent}>
          {children}
        </section>
      </main>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
