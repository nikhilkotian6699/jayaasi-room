'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SUITE_ROOMS } from '@/lib/admin-data';
import AdminQrPanel from '@/components/room-access/AdminQrPanel';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ReportQrDamageModal from '@/components/admin/ReportQrDamageModal';

export default function AdminRoomsPage() {
  const { isOwner, isStaff, apiFetch } = useAdminAuth();
  const [rooms, setRooms] = useState(SUITE_ROOMS);
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [inspectRoom, setInspectRoom] = useState(null);
  const [checkInModalRoom, setCheckInModalRoom] = useState(null);
  const [checkInForm, setCheckInForm] = useState({ guestName: '', checkOut: 'Tomorrow, 11:00 AM' });

  // Damage report modal state
  const [damageModalOpen, setDamageModalOpen] = useState(false);
  const [damageRoomNum, setDamageRoomNum] = useState('204');

  // Create room modal state (for Owner)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoomNum, setNewRoomNum] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newFloor, setNewFloor] = useState('Floor 2');
  const [newRoomTypeId, setNewRoomTypeId] = useState('');
  const [roomTypes, setRoomTypes] = useState([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live rooms from API
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data?.rooms) {
        setRooms(data.rooms);
      }
    } catch (e) {
      console.warn('Could not fetch rooms:', e);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOwner) {
      apiFetch('/api/v1/room-types')
        .then((data) => {
          if (data?.roomTypes?.length) {
            setRoomTypes(data.roomTypes);
            setNewRoomTypeId(data.roomTypes[0].id);
          }
        })
        .catch((e) => console.warn('Could not fetch room types:', e));
    }
  }, [isOwner, apiFetch]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomNum || !newDisplayName) return;
    setIsSubmitting(true);
    try {
      const payload = {
        roomNumber: newRoomNum,
        displayName: newDisplayName,
        roomTypeId: newRoomTypeId || (roomTypes[0] ? roomTypes[0].id : null),
        floor: newFloor,
      };

      const res = await apiFetch('/api/v1/rooms', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res?.success) {
        setActionSuccessMsg(`Room ${newRoomNum} created successfully with Permanent QR: ${res.qr?.qrPublicId || 'ACTIVE'}`);
        setCreateModalOpen(false);
        setNewRoomNum('');
        setNewDisplayName('');
        fetchRooms();
        setTimeout(() => setActionSuccessMsg(null), 6000);
      } else {
        alert(res?.error || 'Failed to create room');
      }
    } catch (err) {
      alert('Error creating room: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (roomNumber, newStatus, guest = null) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.number === roomNumber) {
          return {
            ...r,
            status: newStatus,
            guest: guest !== null ? guest : newStatus === 'Available' || newStatus === 'Cleaning' ? 'Vacant' : r.guest,
            folio: newStatus === 'Available' ? '₹0' : r.folio,
            hasInvoice: newStatus === 'Occupied' ? true : r.hasInvoice,
          };
        }
        return r;
      })
    );

    try {
      await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumber, status: newStatus, guest }),
      });
    } catch (e) {
      console.error('Failed to sync room status:', e);
    }
  };

  const handlePerformCheckIn = (e) => {
    e.preventDefault();
    if (!checkInModalRoom || !checkInForm.guestName) return;

    handleStatusChange(checkInModalRoom.number, 'Occupied', checkInForm.guestName);
    setCheckInModalRoom(null);
    setCheckInForm({ guestName: '', checkOut: 'Tomorrow, 11:00 AM' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Occupied': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', dot: '#ef4444' };
      case 'Cleaning': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', dot: '#f59e0b' };
      case 'Available': return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', dot: '#10b981' };
      case 'Maintenance': return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', dot: '#94a3b8' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', dot: '#94a3b8' };
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchFloor = selectedFloor === 'All' || room.floor.includes(selectedFloor);
    const matchStatus = selectedStatus === 'All' || room.status === selectedStatus;
    return matchFloor && matchStatus;
  });

  const occupiedCount = rooms.filter((r) => r.status === 'Occupied').length;
  const cleaningCount = rooms.filter((r) => r.status === 'Cleaning').length;
  const availableCount = rooms.filter((r) => r.status === 'Available').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'Maintenance').length;

  return (
    <div>
      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1.5px solid #a7f3d0',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span>
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
            Suites & Room Operations — All Rooms ({rooms.length})
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Live status, housekeeping workflow, keycard management & direct folio access for all rooms
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isOwner && (
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                background: '#7a0c24',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(122,12,36,0.2)',
              }}
            >
              <span>+ Add Room</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', fontWeight: 600 }}>
              🔴 Occupied: <strong>{occupiedCount}</strong>
            </span>
            <span style={{ fontSize: '12.5px', background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fde68a', fontWeight: 600 }}>
              🟡 Cleaning: <strong>{cleaningCount}</strong>
            </span>
            <span style={{ fontSize: '12.5px', background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '8px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
              🟢 Available: <strong>{availableCount}</strong>
            </span>
            <span style={{ fontSize: '12.5px', background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
              ⚪ Maint: <strong>{maintenanceCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '6px' }}>
            Floor Wing:
          </span>
          {['All', 'Floor 2', 'Floor 3'].map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => setSelectedFloor(fl)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                border: selectedFloor === fl ? '1.5px solid #7a0c24' : '1px solid #cbd5e1',
                background: selectedFloor === fl ? '#7a0c24' : '#f8fafc',
                color: selectedFloor === fl ? '#ffffff' : '#334155',
                cursor: 'pointer',
              }}
            >
              {fl === 'All' ? 'All Floors' : fl === 'Floor 2' ? 'Floor 2 (Suites Wing)' : 'Floor 3 (Premier Wing)'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '6px' }}>
            Status:
          </span>
          {['All', 'Occupied', 'Cleaning', 'Available', 'Maintenance'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                border: 'none',
                background: selectedStatus === st ? '#0f172a' : '#f1f5f9',
                color: selectedStatus === st ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredRooms.map((room) => {
          const colors = getStatusColor(room.status);
          const isSuite204 = room.number === '204';

          return (
            <div
              key={room.number}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: isSuite204 ? '2px solid #7a0c24' : '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: isSuite204 ? '0 8px 24px rgba(122,12,36,0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {isSuite204 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: '#7a0c24',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.4px',
                  }}
                >
                  LIVE GUEST APP DEMO SUITE
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                        Room {room.number}
                      </h3>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {room.floor}
                      </span>
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>{room.name}</span>
                  </div>

                  <span
                    style={{
                      background: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.dot }} />
                    {room.status}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Registered Guest:</span>
                    <strong style={{ color: '#1e293b' }}>{room.guest}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Check-out:</span>
                    <span style={{ color: '#475569' }}>{room.checkOut}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ color: '#64748b' }}>Folio Balance:</span>
                    <strong style={{ color: room.folio !== '₹0' ? '#7a0c24' : '#64748b', fontSize: '13px' }}>
                      {room.folio}
                    </strong>
                  </div>
                </div>

                {/* Badges for requests */}
                {room.activeRequests > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <Link
                      href="/admin/requests"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        background: '#fef2f2',
                        color: '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        border: '1px solid #fecaca',
                      }}
                    >
                      <span>🛎️</span>
                      <span>{room.activeRequests} Active Room Requests</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setInspectRoom(room)}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '8px 11px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Room Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDamageRoomNum(room.number);
                    setDamageModalOpen(true);
                  }}
                  style={{
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    padding: '8px 11px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Report QR damage for this room"
                >
                  <span>⚠️</span>
                  <span>Report QR</span>
                </button>

                <a
                  href={`/?room=${room.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#fff1f2',
                    color: '#9f1239',
                    border: '1px solid #fecdd3',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title={`Launch Guest Web Portal for Suite ${room.number}`}
                >
                  <span>Guest View</span>
                  <span style={{ fontSize: '10px' }}>↗</span>
                </a>

                {room.status === 'Occupied' ? (
                  <>
                    {isOwner && (
                      <Link
                        href={`/admin/invoices?room=${room.number}`}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          background: '#7a0c24',
                          color: '#ffffff',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        View Folio
                      </Link>
                    )}
                    <button
                      onClick={() => handleStatusChange(room.number, 'Cleaning')}
                      style={{
                        background: '#ffffff',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flex: isOwner ? 'none' : 1,
                      }}
                    >
                      Check-Out
                    </button>
                  </>
                ) : room.status === 'Cleaning' ? (
                  <button
                    onClick={() => handleStatusChange(room.number, 'Available')}
                    style={{
                      flex: 1,
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark Clean & Ready
                  </button>
                ) : room.status === 'Maintenance' ? (
                  <button
                    onClick={() => handleStatusChange(room.number, 'Cleaning')}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Release from Maintenance
                  </button>
                ) : (
                  <button
                    onClick={() => setCheckInModalRoom(room)}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Assign Guest / Check-In
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Profile Modal */}
      {inspectRoom && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setInspectRoom(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  Suite {inspectRoom.number} Profile
                </h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {inspectRoom.name} · {inspectRoom.floor}
                </span>
              </div>
              <button
                onClick={() => setInspectRoom(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Occupancy</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{inspectRoom.status}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Current Folio</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#7a0c24', marginTop: '2px' }}>{inspectRoom.folio}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>AC Climate</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>21°C · Normal</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>RFID Keycards</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>2 Active Issued</div>
              </div>
            </div>

            <div style={{ background: '#fef3c7', padding: '12px 14px', borderRadius: '10px', marginBottom: '18px', fontSize: '12.5px', color: '#92400e' }}>
              <strong>Occupant Info:</strong> {inspectRoom.guest}
              <div style={{ marginTop: '2px' }}>Check-out: {inspectRoom.checkOut}</div>
            </div>

            {/* QR & Session Management Panel */}
            {inspectRoom.id && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  🔲 QR Code &amp; Sessions
                </div>
                <AdminQrPanel
                  roomId={inspectRoom.id}
                  roomNumber={inspectRoom.number}
                  hotelCode={inspectRoom.hotelCode || 'LIVINN'}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <a
                href={`/?room=${inspectRoom.number}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#fff1f2',
                  color: '#9f1239',
                  border: '1px solid #fecdd3',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>Launch Guest View (Room {inspectRoom.number})</span>
                <span>↗</span>
              </a>
              <Link
                href={`/admin/invoices?room=${inspectRoom.number}`}
                style={{
                  background: '#7a0c24',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Go to Room Folio →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {checkInModalRoom && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setCheckInModalRoom(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Quick Check-In Suite {checkInModalRoom.number}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {checkInModalRoom.name} · {checkInModalRoom.floor}
                </span>
              </div>
              <button
                onClick={() => setCheckInModalRoom(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePerformCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Guest Full Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={checkInForm.guestName}
                  onChange={(e) => setCheckInForm({ ...checkInForm, guestName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Expected Check-out:
                </label>
                <input
                  type="text"
                  value={checkInForm.checkOut}
                  onChange={(e) => setCheckInForm({ ...checkInForm, checkOut: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCheckInModalRoom(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Room Modal (Owner Admin Only) */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Create New Suite / Room
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Generates Permanent Room QR Code automatically upon creation
                </span>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Room / Suite Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 204 or 401"
                  value={newRoomNum}
                  onChange={(e) => setNewRoomNum(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Display Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Presidential Palm Suite"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Floor Location:
                </label>
                <select
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Floor 1">Floor 1 (Ground Garden)</option>
                  <option value="Floor 2">Floor 2 (Suites Wing)</option>
                  <option value="Floor 3">Floor 3 (Premier Wing)</option>
                  <option value="Floor 4">Floor 4 (Penthouse Level)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Room Type:
                </label>
                <select
                  value={newRoomTypeId}
                  onChange={(e) => setNewRoomTypeId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {roomTypes.length > 0 ? (
                    roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} ({rt.code}) — ₹{Number(rt.basePrice).toLocaleString()}/night
                      </option>
                    ))
                  ) : (
                    <option value="">Standard Executive Suite</option>
                  )}
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b' }}>
                ℹ️ Creating this room will generate a permanent cryptographic QR code and entry in the Jayaasi room directory.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: '#7a0c24', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Creating & Generating QR...' : 'Create Room & QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Damage Report Modal */}
      <ReportQrDamageModal
        isOpen={damageModalOpen}
        onClose={() => setDamageModalOpen(false)}
        defaultRoomNumber={damageRoomNum}
        onSuccess={() => {
          setActionSuccessMsg(`QR Damage ticket reported for Room ${damageRoomNum}. Owner has been notified.`);
          setTimeout(() => setActionSuccessMsg(null), 5000);
        }}
      />
    </div>
  );
}
