'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ForbiddenState from '@/components/admin/ForbiddenState';

export default function RolesPage() {
  const { hasPermission, apiFetch } = useAdminAuth();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!hasPermission('settings.read')) {
    return <ForbiddenState requiredPermission="settings.read" resourceTitle="Roles & Permissions Configuration" />;
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        apiFetch('/api/v1/roles'),
        apiFetch('/api/v1/permissions'),
      ]);
      const rData = await rRes.json();
      const pData = await pRes.json();

      if (rData.success) setRoles(rData.roles || []);
      if (pData.success) setPermissions(pData.permissions || []);
    } catch (err) {
      console.error('[RolesPage] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group permissions by resource
  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = [];
    acc[p.resource].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Role-Based Access Control (RBAC) Matrix
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          Section 4 & 5: Database-Driven Role & Permission Grants · Resource Scope · Action Control
        </p>
      </div>

      {/* Roles Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {roles.map((r) => (
          <div
            key={r.id}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: r.name === 'OWNER_ADMIN' ? '2px solid #7a0c24' : '1px solid #cbd5e1',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: r.name === 'OWNER_ADMIN' ? '#fff1f2' : '#eff6ff',
                  color: r.name === 'OWNER_ADMIN' ? '#9f1239' : '#1d4ed8',
                }}
              >
                {r.name}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                {r.permissionCount} Grants
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '12px 0 6px' }}>
              {r.name === 'OWNER_ADMIN' ? 'Owner Administrator' : 'Staff Operations Admin'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              {r.description}
            </p>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#334155' }}>
            System Permissions & Role Entitlements Matrix
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px' }}>Resource Domain</th>
              <th style={{ padding: '12px 16px' }}>Permission Key</th>
              <th style={{ padding: '12px 16px' }}>Description</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>OWNER_ADMIN</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>STAFF_ADMIN</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedPerms).map(([resource, perms]) =>
              perms.map((p, idx) => {
                const ownerHas = roles.find((r) => r.name === 'OWNER_ADMIN')?.permissions?.includes(p.key);
                const staffHas = roles.find((r) => r.name === 'STAFF_ADMIN')?.permissions?.includes(p.key);

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: idx === 0 ? 700 : 400, color: '#0f172a' }}>
                      {idx === 0 ? resource.toUpperCase() : ''}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#7a0c24' }}>
                      {p.key}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.description}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {ownerHas ? <span style={{ color: '#059669', fontWeight: 800 }}>✓ Granted</span> : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {staffHas ? (
                        <span style={{ color: '#059669', fontWeight: 800 }}>✓ Granted</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>✗ Forbidden</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
