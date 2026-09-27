'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './staff.module.css';

const navItems = [
  { name: 'Dashboard', icon: '⚡', href: '/staff' },
  { name: 'Orders', icon: '♨', href: '/staff/orders' },
  { name: 'Requests', icon: '◷', href: '/staff/requests', badge: true },
];

export default function StaffLayout({ children }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/staff') return pathname === '/staff';
    return pathname.startsWith(href);
  };

  const currentPage = navItems.find(item => isActive(item.href))?.name || 'Dashboard';

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/staff" className={styles.brand}>
            <span className={styles.brandMark}>j<span>.</span></span>
            <strong>JAYAASI ROOM</strong>
          </Link>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.role}>Hotel Staff</span>
          <button className={styles.notifBtn}>
            🔔
            <i className={styles.notifDot}></i>
          </button>
          <div className={styles.userAvatar}>RV</div>
        </div>
      </header>

      <nav className={styles.tabBar}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.tab} ${isActive(item.href) ? styles.tabActive : ''}`}
          >
            <span>{item.icon}</span>
            {item.name}
            {item.badge && <span className={styles.tabBadge}>3</span>}
          </Link>
        ))}
      </nav>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
