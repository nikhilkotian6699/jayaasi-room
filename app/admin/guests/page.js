'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ForbiddenState from '@/components/admin/ForbiddenState';

export default function GuestsPage() {
  const { hasPermission, isOwner, apiFetch } = useAdminAuth();

  const [guestsData, setGuestsData] = useState({ guests: [], summary: {} });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // If user doesn't have permission, reject on frontend too!
  if (!hasPermission('guest.read')) {
    return <ForbiddenState requiredPermission="guest.read" resourceTitle="Guest Database & CRM" />;
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [guestsRes, sessRes] = await Promise.all([
        apiFetch('/api/v1/guests'),
        apiFetch('/api/v1/sessions'),
      ]);
      const gData = await guestsRes.json();
      const sData = await sessRes.json();

      if (gData.success) setGuestsData(gData);
      if (sData.success) setSessions(sData.sessions || []);
    } catch (err) {
      console.error('[GuestsPage] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Poll sessions every 10s
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Guest Tracking, Sessions & Privacy Controls
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          Section 16 & 17: Temporary 60-Second Sessions · Privacy Data Minimization · Returning Guest Analytics
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Guest Sessions (60s)</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {sessions.length}
          </div>
          <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>● Live countdown active</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Tracked Guests</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#7a0c24', marginTop: '4px' }}>
            {guestsData.summary?.totalGuests || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Unique guest profiles</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Returning Guests</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            {guestsData.summary?.returningGuests || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Multi-stay patrons</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Guest Retention Rate</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            {guestsData.summary?.retentionRate || 0}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Loyalty index</div>
        </div>
      </div>

      {/* Live Active 60-Second Sessions */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#334155' }}>
            Live Temporary Room Sessions (Section 17: 60s Expiry)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            QR Scan generated ephemeral sessions with active countdown
          </span>
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No active 60-second guest sessions right now. Scan a room QR code to activate a temporary session.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px' }}>Room</th>
                <th style={{ padding: '12px 16px' }}>Floor</th>
                <th style={{ padding: '12px 16px' }}>Session Token ID</th>
                <th style={{ padding: '12px 16px' }}>Expires In</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e293b' }}>
                    🚪 Suite {s.roomNumber} ({s.displayName})
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{s.floor}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#7a0c24' }}>
                    sess_{s.id.slice(0, 8)}...
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    >
                      ⏱️ {s.remainingSeconds}s remaining
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#047857',
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Guest Directory (Privacy Minimized) */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#334155' }}>
            Guest Activity & History (Data Minimization Applied)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Section 16: Privacy controls mask sensitive contact details while maintaining operational visibility
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px' }}>Guest Name</th>
              <th style={{ padding: '12px 16px' }}>Contact (Masked)</th>
              <th style={{ padding: '12px 16px' }}>VIP Status</th>
              <th style={{ padding: '12px 16px' }}>Current Suite</th>
              <th style={{ padding: '12px 16px' }}>Stay Count</th>
              <th style={{ padding: '12px 16px' }}>Total Spend</th>
              <th style={{ padding: '12px 16px' }}>Recent Activity</th>
            </tr>
          </thead>
          <tbody>
            {guestsData.guests?.map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e293b' }}>
                  {g.displayName}
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>
                  <div>{g.phoneMasked}</div>
                  <div>{g.emailMasked}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {g.vip ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#fef3c7',
                        color: '#92400e',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    >
                      ★ VIP
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Standard</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                  {g.currentRoom ? `Suite ${g.currentRoom}` : 'Checked out'}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                  {g.totalStays} {g.totalStays > 1 ? 'stays (Returning)' : 'stay'}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#7a0c24' }}>
                  ₹{Number(g.totalSpent).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                  {g.recentActivity?.slice(0, 1).map((act, i) => (
                    <div key={i}>{act.summary}</div>
                  )) || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
