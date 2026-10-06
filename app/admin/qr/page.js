'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ForbiddenState from '@/components/admin/ForbiddenState';
import ReportQrDamageModal from '@/components/admin/ReportQrDamageModal';

export default function QrManagementPage() {
  const { hasPermission, isOwner, apiFetch, hotel } = useAdminAuth();

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'rooms' | 'inventory' | 'orders'
  const [replacements, setReplacements] = useState([]);
  const [roomQrs, setRoomQrs] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [qrOrders, setQrOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // New Order Form state
  const [orderQty, setOrderQty] = useState(25);
  const [orderType, setOrderType] = useState('Standard Acrylic Room QR Box');
  const [orderSupplier, setOrderSupplier] = useState('XYZ Hospitality Supplies');
  const [orderAddress, setOrderAddress] = useState('Livinn Hotel Front Desk, Pune');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Replacements
      const repRes = await apiFetch('/api/v1/qr-replacements');
      const repData = await repRes.json();
      if (repData.success) setReplacements(repData.replacements || []);

      // 2. Room QRs
      if (hasPermission('qr.read')) {
        const qrRes = await apiFetch('/api/v1/qr');
        const qrData = await qrRes.json();
        if (qrData.success) setRoomQrs(qrData.qrs || []);
      }

      // 3. QR Inventory & Orders (Owner only)
      if (hasPermission('qr_inventory.read')) {
        const [invRes, ordRes] = await Promise.all([
          apiFetch('/api/v1/qr-inventory'),
          apiFetch('/api/v1/qr-orders'),
        ]);
        const invData = await invRes.json();
        const ordData = await ordRes.json();
        if (invData.success) setInventoryStats(invData);
        if (ordData.success) setQrOrders(ordData.orders || []);
      }
    } catch (err) {
      console.error('[QrManagementPage] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, hasPermission]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id) => {
    try {
      const res = await apiFetch(`/api/v1/qr-replacements/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Replacement request #${id.slice(0, 8)} approved by Owner.`);
        loadData();
      }
    } catch (err) {
      alert('Error approving request: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await apiFetch(`/api/v1/qr-replacements/${id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Replacement request #${id.slice(0, 8)} rejected.`);
        loadData();
      }
    } catch (err) {
      alert('Error rejecting request: ' + err.message);
    }
  };

  const handleInstall = async (id) => {
    try {
      const res = await apiFetch(`/api/v1/qr-replacements/${id}/install`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(
          `New QR code (${data.newQr?.qrPublicId} v${data.newQr?.qrVersion}) activated! Previous QR revoked.`
        );
        loadData();
      }
    } catch (err) {
      alert('Error installing replacement QR: ' + err.message);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/v1/qr-orders', {
        method: 'POST',
        body: JSON.stringify({
          quantity: orderQty,
          qrBoxType: orderType,
          supplierName: orderSupplier,
          deliveryAddress: orderAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderModalOpen(false);
        setActionSuccessMsg(`Order #${data.order.orderNumber} placed for ${orderQty} QR boxes.`);
        loadData();
      }
    } catch (err) {
      alert('Error placing order: ' + err.message);
    }
  };

  const handleAdvanceOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await apiFetch('/api/v1/qr-orders', {
        method: 'PATCH',
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Order status updated to ${nextStatus}.`);
        loadData();
      }
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    }
  };

  const handleRegenerateQr = async (roomId) => {
    if (!confirm('Regenerate QR? This will revoke the existing QR and issue a new version.')) return;
    try {
      const res = await apiFetch('/api/v1/qr', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`New QR version v${data.qr.qrVersion} (${data.qr.qrPublicId}) generated!`);
        loadData();
      }
    } catch (err) {
      alert('Error regenerating QR: ' + err.message);
    }
  };

  const handleRevokeQr = async (roomId) => {
    if (!confirm('Are you sure you want to revoke this room QR code?')) return;
    try {
      const res = await apiFetch(`/api/v1/qr?roomId=${roomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg('Room QR revoked.');
        loadData();
      }
    } catch (err) {
      alert('Error revoking QR: ' + err.message);
    }
  };

  return (
    <div>
      {/* Top Banner & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            QR Lifecycle, Damage Workflow & Procurement
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Permanent Room QRs · Damage Reporting · Owner Approval · Inventory Stock
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1.5px solid #e11d48',
              background: '#fff1f2',
              color: '#be123c',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚠️</span> Report Damaged QR
          </button>

          {isOwner && (
            <button
              onClick={() => setOrderModalOpen(true)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#7a0c24',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>📦</span> Order QR Boxes
            </button>
          )}
        </div>
      </div>

      {actionSuccessMsg && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span>✓ {actionSuccessMsg}</span>
          <button
            onClick={() => setActionSuccessMsg(null)}
            style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'tickets' ? '#7a0c24' : 'transparent',
            color: activeTab === 'tickets' ? '#ffffff' : '#64748b',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Damage Replacement Tickets ({replacements.length})
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeTab === 'rooms' ? '#7a0c24' : 'transparent',
            color: activeTab === 'rooms' ? '#ffffff' : '#64748b',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Room QR Identities ({roomQrs.length})
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: activeTab === 'inventory' ? '#7a0c24' : 'transparent',
                color: activeTab === 'inventory' ? '#ffffff' : '#64748b',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              QR Inventory Stock & Alerts
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: activeTab === 'orders' ? '#7a0c24' : 'transparent',
                color: activeTab === 'orders' ? '#ffffff' : '#64748b',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Procurement Orders ({qrOrders.length})
            </button>
          </>
        )}
      </div>

      {/* TAB 1: Damage Replacement Tickets */}
      {activeTab === 'tickets' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#334155' }}>
              QR Damage & Replacement Workflow (Section 10 & 11)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Track from REPORTED → APPROVED → ORDERED → INSTALLED → CLOSED
            </span>
          </div>

          {replacements.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No QR damage reports found. All room QR codes are healthy.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px' }}>Room</th>
                    <th style={{ padding: '12px 16px' }}>Reported By</th>
                    <th style={{ padding: '12px 16px' }}>Reason & Description</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Timeline</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {replacements.map((r) => {
                    const statusColors = {
                      REPORTED: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
                      APPROVED: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
                      ORDERED: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
                      INSTALLED: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
                      REJECTED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
                    };
                    const sc = statusColors[r.status] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>🚪</span>
                            <div>
                              <div>Room {r.room?.roomNumber}</div>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>
                                {r.room?.displayName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                          <div>{r.reporter?.name}</div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{r.reporter?.email}</span>
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.reason}</div>
                          {r.description && (
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              {r.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: sc.bg,
                              color: sc.text,
                              border: `1px solid ${sc.border}`,
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                          <div>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                          {r.installedAt && (
                            <div style={{ color: '#059669', fontWeight: 600 }}>
                              Installed {new Date(r.installedAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {r.status === 'REPORTED' && hasPermission('qr_replacement.approve') && (
                              <>
                                <button
                                  onClick={() => handleApprove(r.id)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#059669',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleReject(r.id)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #fca5a5',
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {(r.status === 'APPROVED' || r.status === 'DELIVERED') && (
                              <button
                                onClick={() => handleInstall(r.id)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#7a0c24',
                                  color: '#ffffff',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                🔧 Install Replacement QR
                              </button>
                            )}

                            {r.status === 'INSTALLED' && (
                              <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>
                                ✓ Replacement Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Room QR Identities */}
      {activeTab === 'rooms' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#334155' }}>
              Permanent Room QR Identifiers
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Section 14 & 15: Single Active QR Invariant per Room
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px' }}>Room Number</th>
                  <th style={{ padding: '12px 16px' }}>Floor</th>
                  <th style={{ padding: '12px 16px' }}>QR Public ID</th>
                  <th style={{ padding: '12px 16px' }}>Version</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Public QR URL</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomQrs.map((qr) => (
                  <tr key={qr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e293b' }}>
                      Room {qr.roomNumber}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{qr.floor}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#7a0c24' }}>
                      {qr.qrPublicId}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>v{qr.version}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: qr.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9',
                          color: qr.status === 'ACTIVE' ? '#047857' : '#64748b',
                        }}
                      >
                        {qr.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                      <a href={qr.qrUrl} target="_blank" rel="noreferrer" style={{ color: '#7a0c24', fontWeight: 500 }}>
                        {qr.qrUrl.slice(0, 32)}... ↗
                      </a>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {isOwner && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleRegenerateQr(qr.roomId)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#334155',
                              fontWeight: 600,
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            Regenerate
                          </button>
                          {qr.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleRevokeQr(qr.roomId)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#b91c1c',
                                fontWeight: 600,
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QR Inventory Stock (Owner Only) */}
      {activeTab === 'inventory' && isOwner && (
        <div>
          {/* Low Stock Warning Banner if applicable */}
          {inventoryStats?.lowStockAlert && (
            <div
              style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <strong style={{ color: '#92400e', fontSize: '14px' }}>
                  Low QR Inventory Stock Alert (Section 12)
                </strong>
                <p style={{ margin: '2px 0 0', color: '#b45309', fontSize: '13px' }}>
                  Available stock ({inventoryStats.available}) is below the required minimum threshold (
                  {inventoryStats.minimumStock}). Please place a procurement order to avoid installation delays.
                </p>
              </div>
            </div>
          )}

          {/* Section 12 KPI Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Available In Stock</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {inventoryStats?.available || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Physical boxes ready</div>
            </div>

            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Assigned to Rooms</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#7a0c24', marginTop: '4px' }}>
                {inventoryStats?.assigned || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Active digital identities</div>
            </div>

            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Damaged Pending</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
                {inventoryStats?.damaged || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Reported by staff</div>
            </div>

            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Ordered from Supplier</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                {inventoryStats?.ordered || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>In procurement pipeline</div>
            </div>

            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>In Transit</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>
                {inventoryStats?.inTransit || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Dispatched via courier</div>
            </div>
          </div>

          {/* Inventory SKUs */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                QR Hardware SKUs & Physical Material
              </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px' }}>SKU</th>
                  <th style={{ padding: '12px 16px' }}>Box Material / Type</th>
                  <th style={{ padding: '12px 16px' }}>Available Quantity</th>
                  <th style={{ padding: '12px 16px' }}>Minimum Stock</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryStats?.inventories?.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700 }}>{inv.sku}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{inv.qrBoxType}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '14px' }}>{inv.quantity}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{inv.minimumStock}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: inv.status === 'IN_STOCK' ? '#ecfdf5' : '#fef2f2',
                          color: inv.status === 'IN_STOCK' ? '#047857' : '#b91c1c',
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Procurement Orders (Owner Only) */}
      {activeTab === 'orders' && isOwner && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#334155' }}>
              QR Procurement Order Pipeline (Section 13)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              ORDERED → CONFIRMED → DISPATCHED → IN_TRANSIT → DELIVERED
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px' }}>Order Number</th>
                  <th style={{ padding: '12px 16px' }}>Box Type</th>
                  <th style={{ padding: '12px 16px' }}>Quantity</th>
                  <th style={{ padding: '12px 16px' }}>Supplier</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Advance Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {qrOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700 }}>
                      {ord.orderNumber}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{ord.qrBoxType}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{ord.quantity} units</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{ord.supplierName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#eff6ff',
                          color: '#1d4ed8',
                        }}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {ord.status === 'ORDERED' && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(ord.id, 'DISPATCHED')}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Mark Dispatched →
                          </button>
                        )}
                        {ord.status === 'DISPATCHED' && (
                          <button
                            onClick={() => handleAdvanceOrderStatus(ord.id, 'DELIVERED')}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#059669',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Mark Delivered ✓
                          </button>
                        )}
                        {ord.status === 'DELIVERED' && (
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>
                            Delivered to Hotel Stock
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order QR Boxes Modal */}
      {orderModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                background: '#7a0c24',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Order QR Boxes</h3>
                <span style={{ fontSize: '12px', opacity: 0.85 }}>Section 13 QR Procurement Management</span>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Box Type / Specification
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Standard Acrylic Room QR Box">Standard Acrylic Room QR Box</option>
                  <option value="Brushed Brass QR Plaque">Brushed Brass QR Plaque</option>
                  <option value="Bamboo Eco QR Standee">Bamboo Eco QR Standee</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Supplier
                </label>
                <input
                  type="text"
                  value={orderSupplier}
                  onChange={(e) => setOrderSupplier(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={orderAddress}
                  onChange={(e) => setOrderAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#7a0c24',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Damage Modal */}
      <ReportQrDamageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialRoomNumber="204"
        onSuccess={() => {
          setActionSuccessMsg('Damage report submitted for Room 204. Owner notified.');
          loadData();
        }}
      />
    </div>
  );
}
