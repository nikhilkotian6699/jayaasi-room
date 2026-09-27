'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';

export default function MaintenancePage() {
  const baseUrl = '/jayaasi-rooms/204';
  const [issueType, setIssueType] = useState('Air Conditioning');
  const [urgency, setUrgency] = useState('Standard');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const quickIssues = [
    { name: 'Air Conditioning', icon: '❄️', desc: 'Not cooling / remote issue' },
    { name: 'Smart TV & Cable', icon: '📺', desc: 'Channels / HDMI / audio' },
    { name: 'Bathroom & Water', icon: '🚿', desc: 'Hot water / shower / drain' },
    { name: 'Lighting & Power', icon: '💡', desc: 'Socket / lamp / switches' },
    { name: 'Door & Electronic Key', icon: '🔑', desc: 'Lock mechanism / battery' },
    { name: 'Other Assistance', icon: '🔧', desc: 'General handyman support' },
  ];

  return (
    <div className="guest-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#18191b',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '999px',
          zIndex: 999,
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Shared Luxury Header */}
      <GuestHeader hotelName="Hotel name" />

      {/* Main Content */}
      <main className="guest-main-body">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '4px 0 16px',
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px', margin: 0 }}>
              Room Maintenance
            </h1>
            <p style={{ fontSize: '11px', color: '#6d7280', margin: '2px 0 0' }}>
              Technicians on duty 24/7 for Room 204
            </p>
          </div>

          <Link href={`${baseUrl}/services`} style={{
            fontSize: '11px',
            color: 'var(--guest-maroon)',
            fontWeight: '700',
            textDecoration: 'none',
            background: 'rgba(122, 12, 36, 0.08)',
            padding: '5px 12px',
            borderRadius: '999px',
          }}>
            ← Services
          </Link>
        </div>

        {/* Quick Issue Selector */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid #e9ecef',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          marginBottom: '16px',
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 12px' }}>
            Select Issue Category
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {quickIssues.map((iss) => (
              <div
                key={iss.name}
                onClick={() => setIssueType(iss.name)}
                style={{
                  padding: '10px',
                  borderRadius: '14px',
                  border: issueType === iss.name ? '1.5px solid var(--guest-maroon)' : '1px solid #edf0f3',
                  background: issueType === iss.name ? '#fdf4f6' : '#fafafb',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{iss.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#222' }}>{iss.name}</div>
                <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>{iss.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#333', display: 'block', marginBottom: '6px' }}>
              Notes / Location in room (Optional)
            </label>
            <textarea
              placeholder="e.g. Master bedroom AC is blowing warm air..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                fontSize: '12px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <button
            onClick={() => showToast(`Ticket raised for "${issueType}"! Maintenance staff dispatched.`)}
            style={{
              width: '100%',
              marginTop: '14px',
              padding: '12px',
              background: 'linear-gradient(135deg, #870f2b 0%, #5d061a 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(122, 12, 36, 0.35)',
            }}
          >
            Dispatch Technician
          </button>
        </div>
      </main>

      {/* Shared Luxury Footer */}
      <GuestFooter activeTab="services" />
    </div>
  );
}
