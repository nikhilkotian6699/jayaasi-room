'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { INITIAL_ROOM_REQUESTS, ALL_ROOM_INVOICES, SUITE_ROOMS } from '@/lib/admin-data';
import ReportQrDamageModal from '@/components/admin/ReportQrDamageModal';

export default function AdminOverviewPage() {
  const { isOwner, isStaff, role, user, department, apiFetch } = useAdminAuth();

  const [requests, setRequests] = useState(INITIAL_ROOM_REQUESTS);
  const [tasks, setTasks] = useState([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedRoomForReport, setSelectedRoomForReport] = useState('204');
  const [actionSuccess, setActionSuccess] = useState(null);

  const invoices = ALL_ROOM_INVOICES;
  const suite204Invoice = invoices.find((inv) => inv.room === '204') || invoices[0];

  const loadOperationalTasks = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('[AdminOverviewPage] Error loading tasks:', err);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadOperationalTasks();
  }, [loadOperationalTasks]);

  const handleUpdateStatus = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await apiFetch(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Task status updated to ${newStatus}.`);
        loadOperationalTasks();
      }
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const activeCount = requests.filter((r) => r.status !== 'Completed').length;
  const totalHotelRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const occupiedCount = SUITE_ROOMS.filter((r) => r.status === 'Occupied').length;
  const occupancyRate = Math.round((occupiedCount / SUITE_ROOMS.length) * 100);

  // Departmental filter for staff live requests
  const filteredRequests = isStaff
    ? requests.filter((r) => {
        if (department === 'KITCHEN') return r.department === 'Kitchen' || r.category === 'Dining';
        if (department === 'HOUSEKEEPING') return r.department === 'Housekeeping' || r.category === 'Housekeeping';
        if (department === 'MAINTENANCE') return r.department === 'Maintenance' || r.category === 'Maintenance';
        return true;
      })
    : requests;

  return (
    <div>
      {/* Role Notice & Security Banner */}
      <div
        style={{
          background: isOwner ? 'linear-gradient(135deg, #fff1f2 0%, #fff 100%)' : '#f0fdf4',
          border: isOwner ? '1px solid #fecdd3' : '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{isOwner ? '👑' : '🛡️'}</span>
            <strong style={{ fontSize: '14px', color: isOwner ? '#881337' : '#166534' }}>
              Active Session: {user?.name || 'Administrator'} ({role})
            </strong>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: isOwner ? '#9f1239' : '#15803d' }}>
            {isOwner
              ? 'Full business and operational control granted across all property domains and financial reporting.'
              : `Operational view scoped to ${department || 'Assigned'} department. Sensitive guest and revenue data restricted server-side.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setSelectedRoomForReport('204');
              setReportModalOpen(true);
            }}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              border: '1px solid #f43f5e',
              background: '#fff1f2',
              color: '#e11d48',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ⚠️ Report QR Damage
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ✓ {actionSuccess}
        </div>
      )}

      {/* ── STAFF ADMIN VIEW (Intentionally Limited) ──────────────── */}
      {isStaff ? (
        <div>
          {/* Staff Metric Cards */}
          <div className="admin-metrics-grid" style={{ marginBottom: '24px' }}>
            <div className="admin-metric-card">
              <div className="admin-metric-top">
                <span className="admin-metric-title">My Assigned Tasks</span>
                <div className="admin-metric-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                  📋
                </div>
              </div>
              <div className="admin-metric-value">{tasks.length}</div>
              <div className="admin-metric-sub">
                <span>{tasks.filter((t) => t.status === 'COMPLETED').length} completed today</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-top">
                <span className="admin-metric-title">{department} Service Requests</span>
                <div className="admin-metric-icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                  🛎️
                </div>
              </div>
              <div className="admin-metric-value">{filteredRequests.length}</div>
              <div className="admin-metric-sub">
                <span>Filtered for {department} team</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-top">
                <span className="admin-metric-title">Target Response Time</span>
                <div className="admin-metric-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                  ⚡
                </div>
              </div>
              <div className="admin-metric-value">&lt; 15m</div>
              <div className="admin-metric-sub" style={{ color: '#047857' }}>
                <span>Standard luxury SLA</span>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-top">
                <span className="admin-metric-title">Active Suite Context</span>
                <div className="admin-metric-icon" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
                  🚪
                </div>
              </div>
              <div className="admin-metric-value">Suite 204</div>
              <div className="admin-metric-sub" style={{ color: '#6d28d9' }}>
                <span>Assigned turn-down location</span>
              </div>
            </div>
          </div>

          {/* Staff Tasks Split Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
            {/* My Active Tasks */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                  My Assigned Operations
                </h3>
                <Link href="/admin/tasks" style={{ fontSize: '12px', color: '#7a0c24', fontWeight: 600 }}>
                  View All Tasks →
                </Link>
              </div>

              {tasks.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  No tasks currently assigned. Check back shortly.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {tasks.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c' }}>
                            ● {t.priority}
                          </span>
                          {t.room && (
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                              Room {t.room.roomNumber}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                          {t.title}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {t.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleUpdateTaskStatus(t.id, 'COMPLETED')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#059669',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Mark Done
                          </button>
                        ) : (
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>✓ Done</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department Live Orders */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                  {department} Live Requests
                </h3>
                <Link href="/admin/requests" style={{ fontSize: '12px', color: '#7a0c24', fontWeight: 600 }}>
                  View All →
                </Link>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {filteredRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#7a0c24' }}>
                        Room {req.room} · {req.item}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{req.specialNotes || 'Standard order'}</div>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                      }}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── OWNER ADMIN VIEW (Full Business + Operations Control) ── */
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
          <div className="admin-content-split">
            {/* Live Feed */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">Live Room Service Requests</h2>
                  <p className="admin-card-desc">Real-time dispatches from Suite QR codes</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href="/admin/requests" className="admin-btn-secondary" style={{ fontSize: '12px' }}>
                    View All ({requests.length}) →
                  </Link>
                </div>
              </div>

              <div className="admin-feed-list">
                {requests.slice(0, 5).map((req) => (
                  <div key={req.id} className="admin-feed-item">
                    <div className="admin-feed-badge-col">
                      <span className="admin-room-pill">Suite {req.room}</span>
                      <span className="admin-dept-pill">{req.department}</span>
                    </div>

                    <div className="admin-feed-details">
                      <div className="admin-feed-item-title">{req.item}</div>
                      <div className="admin-feed-meta">
                        <span>{req.guest}</span>
                        <span>·</span>
                        <span>₹{req.price}</span>
                        <span>·</span>
                        <span style={{ color: '#6b7280' }}>{req.time}</span>
                      </div>
                      {req.specialNotes && (
                        <div className="admin-feed-note">
                          <span>Note: </span>
                          {req.specialNotes}
                        </div>
                      )}
                    </div>

                    <div className="admin-feed-actions">
                      <span
                        className={`admin-status-tag ${
                          req.status === 'Completed'
                            ? 'completed'
                            : req.status === 'In Progress'
                            ? 'in-progress'
                            : 'pending'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Completed')}
                          className="admin-btn-action"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Suite Matrix */}
            <div className="admin-side-col">
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Suite Status Matrix</h3>
                    <p className="admin-card-desc">PMS room availability & occupancy</p>
                  </div>
                  <Link href="/admin/rooms" style={{ fontSize: '11px', color: '#7a0c24', fontWeight: 600 }}>
                    Manage →
                  </Link>
                </div>

                <div className="admin-room-grid-compact">
                  {SUITE_ROOMS.map((r) => (
                    <div
                      key={r.number}
                      className={`admin-room-chip ${
                        r.status === 'Occupied'
                          ? 'occupied'
                          : r.status === 'Cleaning'
                          ? 'cleaning'
                          : 'available'
                      }`}
                    >
                      <span className="chip-num">{r.number}</span>
                      <span className="chip-status">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suite 204 Spotlight */}
              <div
                className="admin-card"
                style={{
                  borderLeft: '4px solid #7a0c24',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fffbfb 100%)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#7a0c24', letterSpacing: '0.05em' }}>
                      SPOTLIGHT SUITE
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                      Suite 204 — Ananya Mehta
                    </h4>
                  </div>
                  <span className="admin-status-tag occupied" style={{ fontSize: '10px' }}>Checked-In</span>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                  Business Suite · Folio Total: ₹{suite204Invoice.grandTotal.toLocaleString('en-IN')}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href="/admin/rooms"
                    className="admin-btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', flex: 1, textAlign: 'center' }}
                  >
                    Inspect QR & Room →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report QR Damage Modal */}
      <ReportQrDamageModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialRoomNumber={selectedRoomForReport}
        onSuccess={() => {
          setActionSuccess('QR Damage reported. Ticket created in status REPORTED.');
        }}
      />
    </div>
  );
}
