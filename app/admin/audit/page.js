'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ForbiddenState from '@/components/admin/ForbiddenState';

export default function AuditLogsPage() {
  const { hasPermission, apiFetch } = useAdminAuth();

  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [loading, setLoading] = useState(true);

  if (!hasPermission('audit.read')) {
    return <ForbiddenState requiredPermission="audit.read" resourceTitle="System Audit Logs" />;
  }

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterAction ? `/api/v1/audit?action=${filterAction}` : '/api/v1/audit';
      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('[AuditLogsPage] Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, filterAction]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Security & Operations Audit Trail
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          Section 18: Cryptographically tracked event log of administrative mutations, QR actions, and task events
        </p>
      </div>

      {/* Filter */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Filter by Action:</label>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            color: '#1e293b',
          }}
        >
          <option value="">All Audit Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="ROOM_CREATED">ROOM_CREATED</option>
          <option value="ROOM_UPDATED">ROOM_UPDATED</option>
          <option value="QR_CREATED">QR_CREATED</option>
          <option value="QR_REVOKED">QR_REVOKED</option>
          <option value="QR_REPLACED">QR_REPLACED</option>
          <option value="QR_DAMAGE_REPORTED">QR_DAMAGE_REPORTED</option>
          <option value="QR_REPLACEMENT_APPROVED">QR_REPLACEMENT_APPROVED</option>
          <option value="QR_ORDER_CREATED">QR_ORDER_CREATED</option>
          <option value="TASK_CREATED">TASK_CREATED</option>
          <option value="TASK_UPDATED">TASK_UPDATED</option>
          <option value="TASK_COMPLETED">TASK_COMPLETED</option>
        </select>
        <button
          onClick={loadLogs}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Refresh Log
        </button>
      </div>

      {/* Logs Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
              <th style={{ padding: '12px 16px' }}>Actor User</th>
              <th style={{ padding: '12px 16px' }}>Resource Type / ID</th>
              <th style={{ padding: '12px 16px' }}>Mutation Data (Old → New)</th>
              <th style={{ padding: '12px 16px' }}>IP Hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: log.action.includes('REPLACE') || log.action.includes('DAMAGE')
                        ? '#fff1f2'
                        : log.action.includes('LOGIN')
                        ? '#eff6ff'
                        : log.action.includes('TASK')
                        ? '#ecfdf5'
                        : '#f8fafc',
                      color: log.action.includes('REPLACE') || log.action.includes('DAMAGE')
                        ? '#be123c'
                        : log.action.includes('LOGIN')
                        ? '#1d4ed8'
                        : log.action.includes('TASK')
                        ? '#047857'
                        : '#334155',
                      fontFamily: 'monospace',
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{log.user?.name || 'System Actor'}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{log.user?.email || '—'}</div>
                </td>
                <td style={{ padding: '12px 16px', color: '#475569', fontSize: '12px' }}>
                  <strong>{log.resourceType}</strong>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>
                    {log.resourceId?.slice(0, 16)}...
                  </div>
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '320px', fontSize: '11px', fontFamily: 'monospace' }}>
                  {log.newValue ? (
                    <span style={{ color: '#0f766e', background: '#f0fdfa', padding: '3px 6px', borderRadius: '4px' }}>
                      {JSON.stringify(log.newValue).slice(0, 80)}...
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}>
                  {log.ipHash ? log.ipHash.slice(0, 12) + '...' : '127.0.0.1 (local)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
