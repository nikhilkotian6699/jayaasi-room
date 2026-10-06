'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function ReportQrDamageModal({ isOpen, onClose, initialRoomId, initialRoomNumber, onSuccess }) {
  const { apiFetch } = useAdminAuth();
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [roomNumber, setRoomNumber] = useState(initialRoomNumber || '204');
  const [reason, setReason] = useState('QR box damaged / scratched plate');
  const [description, setDescription] = useState('Nightstand QR plate is visibly scratched and phone camera cannot focus.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // If roomId wasn't passed directly, fetch room ID by number
      let targetRoomId = initialRoomId || roomId;
      if (!targetRoomId) {
        const roomsRes = await apiFetch('/api/v1/rooms');
        const data = await roomsRes.json();
        const found = data.rooms?.find((r) => r.roomNumber === roomNumber);
        if (found) targetRoomId = found.id;
      }

      if (!targetRoomId) {
        throw new Error('Please enter a valid room number');
      }

      const res = await apiFetch('/api/v1/qr-replacements', {
        method: 'POST',
        body: JSON.stringify({
          roomId: targetRoomId,
          reason,
          description,
          photoUrl: '/images/qr-damaged-sample.png',
        }),
      });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit QR damage report');
      }

      if (onSuccess) onSuccess(result.replacement);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7a0c24 0%, #4a0715 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Report Damaged QR Box</h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>
              Section 10 Operational Workflow · Room QR Replacement
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '22px',
              cursor: 'pointer',
              opacity: 0.8,
            }}
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                border: '1px solid #fecaca',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Room Number
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              disabled={!!initialRoomNumber}
              placeholder="e.g. 204"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1e293b',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Damage Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                color: '#1e293b',
              }}
            >
              <option value="QR box damaged / scratched plate">QR box damaged / scratched plate</option>
              <option value="Acrylic frame cracked or broken">Acrylic frame cracked or broken</option>
              <option value="QR code peeling or faded">QR code peeling or faded</option>
              <option value="Guest phone camera fails to scan">Guest phone camera fails to scan</option>
              <option value="Missing QR box from nightstand">Missing QR box from nightstand</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Inspection Notes / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details observed during room turn-down or inspection..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                color: '#1e293b',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Photo preview indicator */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '24px' }}>📷</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Evidence Photo Attached</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>room204_damaged_qr_inspection.jpg (Ready for Owner review)</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#7a0c24',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Damage Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
