'use client';

import { useState } from 'react';
import Link from 'next/link';
import { INITIAL_ROOM_REQUESTS, ALL_ROOM_INVOICES, SUITE_ROOMS } from '@/lib/admin-data';

export default function AdminOverviewPage() {
  const [requests, setRequests] = useState(INITIAL_ROOM_REQUESTS);
  const invoices = ALL_ROOM_INVOICES;
  const suite204Invoice = invoices.find((inv) => inv.room === '204') || invoices[0];

  const handleUpdateStatus = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  const activeCount = requests.filter((r) => r.status !== 'Completed').length;
  const totalHotelRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const occupiedCount = SUITE_ROOMS.filter((r) => r.status === 'Occupied').length;
  const occupancyRate = Math.round((occupiedCount / SUITE_ROOMS.length) * 100);

  return (
    <div>
      {/* 4 Metric KPI Cards across ALL Rooms */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Active Requests (All Rooms)</span>
            <div className="admin-metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
              🛎️
            </div>
          </div>
          <div className="admin-metric-value">{activeCount}</div>
          <div className="admin-metric-sub">
            <span>● Dispatches across 5 wings & floors</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Total Hotel Folio Balance</span>
            <div className="admin-metric-icon" style={{ background: '#fffbeb', color: '#b45309' }}>
              🧾
            </div>
          </div>
          <div className="admin-metric-value">₹{totalHotelRevenue.toLocaleString('en-IN')}</div>
          <div className="admin-metric-sub" style={{ color: '#b45309' }}>
            <span>Across all {invoices.length} occupied guest suites</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Suites Occupancy</span>
            <div className="admin-metric-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
              🚪
            </div>
          </div>
          <div className="admin-metric-value">{occupancyRate}%</div>
          <div className="admin-metric-sub">
            <span>{occupiedCount} of {SUITE_ROOMS.length} rooms occupied</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Guest Satisfaction Index</span>
            <div className="admin-metric-icon" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
              ⭐
            </div>
          </div>
          <div className="admin-metric-value">4.92 / 5.0</div>
          <div className="admin-metric-sub" style={{ color: '#6d28d9' }}>
            <span>Overall luxury guest rating</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Live Feed (2fr) + All Rooms Status Matrix (1fr) */}
      <div className="admin-grid-split">
        {/* Left Side: Live Requests Feed */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <div className="admin-panel-title">Incoming Guest Requests — All Suites</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Real-time room service dispatch feed for all floors
              </div>
            </div>
            <Link
              href="/admin/requests"
              style={{
                fontSize: '13px',
                color: '#7a0c24',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View & Filter All ({requests.length}) →
            </Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Service & Items</th>
                <th>Suite / Room</th>
                <th>Billed</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 6).map((req) => (
                <tr key={req.id}>
                  <td>
                    <strong style={{ color: '#0f172a', fontSize: '13px' }}>{req.id}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{req.timestamp}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.serviceType}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {req.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        color: '#7a0c24',
                        background: '#fff1f2',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                      }}
                    >
                      Room {req.room}
                    </span>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{req.guest}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {req.totalAmount > 0 ? `₹${req.totalAmount}` : 'Complimentary'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        req.status === 'New'
                          ? 'new'
                          : req.status === 'In Progress'
                          ? 'in-progress'
                          : 'completed'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'New' ? (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'In Progress')}
                        style={{
                          background: '#7a0c24',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Accept
                      </button>
                    ) : req.status === 'In Progress' ? (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'Completed')}
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Complete
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        ✓ Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Multi-Room Folios & Room 204 Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Folios by Room */}
          <div className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <div className="admin-panel-title">Active Suite Folios</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>Quick link to any room invoice</div>
              </div>
              <Link
                href="/admin/invoices"
                style={{ fontSize: '12px', color: '#7a0c24', fontWeight: 700, textDecoration: 'none' }}
              >
                Invoices Hub →
              </Link>
            </div>

            <div style={{ padding: '16px' }}>
              {invoices.map((inv) => (
                <div
                  key={inv.room}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: inv.room === '204' ? '#fff1f2' : '#f8fafc',
                    border: inv.room === '204' ? '1px solid #fecdd3' : '1px solid #f1f5f9',
                    marginBottom: '8px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Room {inv.room}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>({inv.suiteName})</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>{inv.guestName}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#7a0c24' }}>
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </div>
                    <Link
                      href={`/admin/invoices?room=${inv.room}`}
                      style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                    >
                      View Folio →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Guest App Suite Highlight */}
          <div className="admin-panel-card">
            <div className="admin-panel-header" style={{ background: '#7a0c24', color: '#ffffff' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Room 204 — Live Guest Context</div>
                <div style={{ fontSize: '11px', color: '#f5df97' }}>Business Suite Active App User</div>
              </div>
              <Link
                href="/admin/invoices?room=204"
                style={{
                  background: '#ffffff',
                  color: '#7a0c24',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Invoice
              </Link>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Guest:</span>
                <strong style={{ color: '#0f172a' }}>{suite204Invoice.guestName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Billed Amount:</span>
                <strong style={{ color: '#7a0c24' }}>₹{suite204Invoice.grandTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Open Requests:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>
                  {requests.filter((r) => r.room === '204' && r.status !== 'Completed').length} Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
