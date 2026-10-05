'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './admin.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname() || '/admin';

  const navItems = [
    { label: 'Overview', href: '/admin', icon: '📊' },
    { label: 'Live Room Requests', href: '/admin/requests', icon: '🛎️', badge: '3' },
    { label: 'Invoices & Billing', href: '/admin/invoices', icon: '🧾' },
    { label: 'Suites & Rooms', href: '/admin/rooms', icon: '🚪' },
    { label: 'Services & Menu', href: '/admin/services', icon: '🍽️' },
  ];

  const getPageTitle = () => {
    if (pathname === '/admin/requests') return 'Live Room Service Requests';
    if (pathname === '/admin/invoices') return 'Guest Folio & Invoices';
    if (pathname === '/admin/rooms') return 'Suite & Room Status';
    if (pathname === '/admin/services') return 'Service Catalog & Menu Controls';
    return 'Hotel Command Center';
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand-header">
          <div className="admin-brand-logo">J.</div>
          <div>
            <div className="admin-brand-title">Jayaasi Rooms</div>
            <div className="admin-brand-subtitle">Hotel Operations</div>
          </div>
        </div>

        <div className="admin-property-card">
          <div className="admin-property-info">
            <span className="admin-property-name">All Suites & Rooms (11)</span>
            <span className="admin-property-status">PMS Connected · 6 Active</span>
          </div>
          <span style={{ fontSize: '18px' }}>🏢</span>
        </div>

        <nav className="admin-nav-section">
          <div className="admin-nav-heading">Operations Portal</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && <span className="admin-badge-count">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">AK</div>
            <div>
              <div className="admin-user-name">Arjun Kumar</div>
              <div className="admin-user-role">Operations Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-page-title">{getPageTitle()}</h1>
            <div className="admin-suite-badge">
              <span>🏨</span>
              <span>All 11 Suites Connected</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-live-pulse">
              <span className="admin-live-dot" />
              <span>Live PMS Dispatch</span>
            </div>
            <Link href="/" target="_blank" className="admin-view-guest-btn">
              <span>View Guest App</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        <main className="admin-body">
          {children}
        </main>
      </div>
    </div>
  );
}
