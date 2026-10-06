'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function ForbiddenState({ requiredPermission, resourceTitle }) {
  const { role, user, department } = useAdminAuth();

  return (
    <div
      style={{
        background: '#fff1f2',
        border: '1.5px solid #fecdd3',
        borderRadius: '16px',
        padding: '36px',
        margin: '24px 0',
        textAlign: 'center',
        boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.08)',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
      <span
        style={{
          display: 'inline-block',
          background: '#be123c',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: '999px',
          marginBottom: '14px',
        }}
      >
        403 Forbidden · Server-Side Enforced
      </span>

      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#881337', marginBottom: '8px' }}>
        Access Restricted: {resourceTitle || 'Owner Protected Resource'}
      </h2>

      <p style={{ maxWidth: '560px', margin: '0 auto 20px', color: '#9f1239', fontSize: '14px', lineHeight: 1.6 }}>
        Your active role <strong>{role}</strong> {department ? `(${department})` : ''} does not have the required
        permission <code>{requiredPermission}</code>. Operational staff are restricted from business financials,
        full guest databases, inventory ordering, and system settings.
      </p>

      <div
        style={{
          display: 'inline-flex',
          gap: '12px',
          background: '#ffffff',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid #fecdd3',
          fontSize: '13px',
          color: '#475569',
          marginBottom: '20px',
        }}
      >
        <span>👤 User: <strong>{user?.name}</strong></span>
        <span>·</span>
        <span>🛡️ Role: <strong>{role}</strong></span>
      </div>

      <div>
        <Link
          href="/admin"
          style={{
            display: 'inline-block',
            background: '#7a0c24',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            padding: '10px 22px',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Return to My Tasks & Operations
        </Link>
      </div>
    </div>
  );
}
