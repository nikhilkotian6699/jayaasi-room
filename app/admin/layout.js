'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth, PRESET_USERS } from '@/context/AdminAuthContext';
import ReportQrDamageModal from '@/components/admin/ReportQrDamageModal';
import './admin.css';

function AdminLayoutInner({ children }) {
  const pathname = usePathname() || '/admin';
  const { user, role, department, hotel, isOwner, isStaff, selectedUserKey, loginAs, permissions } = useAdminAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === '/admin/tasks') return 'Staff Operations & Tasks';
    if (pathname === '/admin/qr') return 'QR Lifecycle, Damage Workflow & Inventory';
    if (pathname === '/admin/guests') return 'Guest Tracking & 60-Second Sessions';
    if (pathname === '/admin/analytics') return 'Executive Business & Revenue Analytics';
    if (pathname === '/admin/staff') return 'Staff Management & Operational RBAC';
    if (pathname === '/admin/audit') return 'Security & System Audit Logs';
    if (pathname === '/admin/roles') return 'Role-Based Access Control Matrix';
    if (pathname === '/admin/requests') return 'Live Operational Requests';
    if (pathname === '/admin/invoices') return 'Guest Folio & Invoices';
    if (pathname === '/admin/rooms') return 'Suite & Room Status';
    return isStaff ? 'My Staff Dashboard' : 'Hotel Owner Command Center';
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand-header">
          <div className="admin-brand-logo">J.</div>
          <div>
            <div className="admin-brand-title">{hotel?.name || 'Jayaasi Rooms'}</div>
            <div className="admin-brand-subtitle">
              {isOwner ? '👑 Owner Administration' : `Staff Admin · ${department || 'Operations'}`}
            </div>
          </div>
        </div>

        {/* Tenant Property Badge */}
        <div className="admin-property-card" style={{ background: isOwner ? '#fff5f7' : '#f8fafc', borderColor: isOwner ? '#fecdd3' : '#e2e8f0' }}>
          <div className="admin-property-info">
            <span className="admin-property-name" style={{ color: isOwner ? '#881337' : '#1e293b' }}>
              {hotel?.code || 'JAYAASI-PUNE'}
            </span>
            <span className="admin-property-status">
              Tenant ID: {hotel?.id ? hotel.id.slice(0, 8) + '...' : 'Live'}
            </span>
          </div>
          <span style={{ fontSize: '18px' }}>🏢</span>
        </div>

        {/* Navigation Sections */}
        <nav className="admin-nav-section" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Main / Tasks */}
          <div className="admin-nav-heading">Operations Portal</div>
          <Link
            href="/admin"
            className={`admin-nav-item ${pathname === '/admin' ? 'active' : ''}`}
          >
            <div className="admin-nav-icon-label">
              <span style={{ fontSize: '16px' }}>📊</span>
              <span>{isStaff ? 'My Dashboard' : 'Overview'}</span>
            </div>
          </Link>

          <Link
            href="/admin/tasks"
            className={`admin-nav-item ${pathname === '/admin/tasks' ? 'active' : ''}`}
          >
            <div className="admin-nav-icon-label">
              <span style={{ fontSize: '16px' }}>📋</span>
              <span>{isStaff ? 'My Assigned Tasks' : 'Operational Tasks'}</span>
            </div>
          </Link>

          <Link
            href="/admin/rooms"
            className={`admin-nav-item ${pathname === '/admin/rooms' ? 'active' : ''}`}
          >
            <div className="admin-nav-icon-label">
              <span style={{ fontSize: '16px' }}>🚪</span>
              <span>{isStaff ? 'Rooms (Limited View)' : 'Suites & Rooms'}</span>
            </div>
          </Link>

          <Link
            href="/admin/requests"
            className={`admin-nav-item ${pathname === '/admin/requests' ? 'active' : ''}`}
          >
            <div className="admin-nav-icon-label">
              <span style={{ fontSize: '16px' }}>🛎️</span>
              <span>{isStaff ? `${department || 'Service'} Orders` : 'Live Room Requests'}</span>
            </div>
          </Link>

          {/* Quick Action for staff */}
          <button
            onClick={() => setReportModalOpen(true)}
            style={{
              width: '100%',
              margin: '8px 0',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #fecdd3',
              background: '#fff1f2',
              color: '#9f1239',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span> Report Damaged QR
          </button>

          {/* OWNER ONLY SECTIONS (Section 19: Strict RBAC) */}
          {isOwner && (
            <>
              <div className="admin-nav-heading" style={{ marginTop: '16px' }}>QR Management</div>
              <Link
                href="/admin/qr"
                className={`admin-nav-item ${pathname === '/admin/qr' ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>📱</span>
                  <span>QR Lifecycle & Inventory</span>
                </div>
              </Link>

              <div className="admin-nav-heading" style={{ marginTop: '16px' }}>Guests & Sessions</div>
              <Link
                href="/admin/guests"
                className={`admin-nav-item ${pathname === '/admin/guests' ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>👥</span>
                  <span>Guests & 60s Sessions</span>
                </div>
              </Link>

              <div className="admin-nav-heading" style={{ marginTop: '16px' }}>Business & Finance</div>
              <Link
                href="/admin/analytics"
                className={`admin-nav-item ${pathname === '/admin/analytics' ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>📈</span>
                  <span>Executive Analytics</span>
                </div>
              </Link>
              <Link
                href="/admin/invoices"
                className={`admin-nav-item ${pathname === '/admin/invoices' ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>🧾</span>
                  <span>Invoices & Folios</span>
                </div>
              </Link>

              <div className="admin-nav-heading" style={{ marginTop: '16px' }}>System Administration</div>
              <Link
                href="/admin/staff"
                className={`admin-nav-item ${pathname === '/admin/staff' ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>🧑‍💼</span>
                  <span>Staff Roster & Roles</span>
                </div>
              </Link>
              <Link
                href="/admin/roles"
                className={`admin-nav-item ${pathname === '/admin/roles' ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>🛡️</span>
                  <span>RBAC Permissions</span>
                </div>
              </Link>
              <Link
                href="/admin/audit"
                className={`admin-nav-item ${pathname === '/admin/audit' ? 'active' : ''}`}
              >
                <div className="admin-nav-icon-label">
                  <span style={{ fontSize: '16px' }}>📜</span>
                  <span>Security Audit Logs</span>
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div
              className="admin-user-avatar"
              style={{
                background: isOwner ? 'linear-gradient(135deg, #7a0c24 0%, #be123c 100%)' : '#2563eb',
              }}
            >
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : 'AK'}
            </div>
            <div>
              <div className="admin-user-name">{user?.name || 'Loading...'}</div>
              <div className="admin-user-role">
                {role} {department ? `· ${department}` : ''}
              </div>
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
              <span>{hotel?.name || 'Jayaasi Rooms'}</span>
            </div>
          </div>

          <div className="admin-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Persona Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Switch User Persona:</span>
              <select
                value={selectedUserKey}
                onChange={(e) => loginAs(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#0f172a',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {PRESET_USERS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.badge} ({u.name.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Role indicator pill */}
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                background: isOwner ? '#fff1f2' : '#eff6ff',
                color: isOwner ? '#9f1239' : '#1d4ed8',
                border: isOwner ? '1px solid #fecdd3' : '1px solid #bfdbfe',
              }}
            >
              {isOwner ? '👑 OWNER_ADMIN (Full Grants)' : `STAFF_ADMIN (${permissions.length} perms)`}
            </span>

            <Link href="/" target="_blank" className="admin-view-guest-btn">
              <span>View Guest App</span>
              <span>↗</span>
            </Link>
          </div>
        </header>

        <main className="admin-body">{children}</main>
      </div>

      {/* Quick Report Damage Modal */}
      <ReportQrDamageModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialRoomNumber="204"
        onSuccess={() => {
          alert('Damage report successfully submitted to Owner Admin.');
        }}
      />
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
