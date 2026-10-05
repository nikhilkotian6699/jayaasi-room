'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_ROOM_REQUESTS, SUITE_ROOMS } from '@/lib/admin-data';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState(INITIAL_ROOM_REQUESTS);
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalRequest, setActiveModalRequest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch live requests from database & API
  const fetchRequests = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data?.requests && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.warn('Could not fetch live requests', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  // New Request Form State
  const [newReq, setNewReq] = useState({
    room: '204',
    guest: 'Ananya Mehta',
    serviceType: 'Food & Dining',
    department: 'Kitchen / Room Service',
    itemName: '',
    qty: 1,
    price: 0,
    specialInstructions: '',
  });

  const categories = [
    'All',
    'Food & Dining',
    'Housekeeping',
    'Laundry & Garment Care',
    'Shoe Care',
    'Luggage Handling',
    'Cab Services',
  ];

  // Distinct rooms present in requests or SUITE_ROOMS
  const roomOptions = useMemo(() => {
    const activeRoomsInReqs = Array.from(new Set(requests.map((r) => r.room))).sort();
    return activeRoomsInReqs;
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchRoom = selectedRoom === 'All' || req.room === selectedRoom;
      const matchCat = selectedCategory === 'All' || req.serviceType === selectedCategory;
      const matchStatus = selectedStatus === 'All' || req.status === selectedStatus;
      const matchSearch =
        searchQuery === '' ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.room.includes(searchQuery) ||
        req.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchRoom && matchCat && matchStatus && matchSearch;
    });
  }, [requests, selectedRoom, selectedCategory, selectedStatus, searchQuery]);

  const handleUpdateStatus = async (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    if (activeModalRequest && activeModalRequest.id === id) {
      setActiveModalRequest((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to sync status update:', e);
    }
  };

  const handleRoomSelectForNewReq = (roomNum) => {
    const foundRoom = SUITE_ROOMS.find((r) => r.number === roomNum);
    setNewReq((prev) => ({
      ...prev,
      room: roomNum,
      guest: foundRoom && foundRoom.guest !== 'Vacant' ? foundRoom.guest : 'Guest of Room ' + roomNum,
    }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newReq.itemName) return;

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: newReq.room,
          guest: newReq.guest,
          serviceType: newReq.serviceType,
          department: newReq.department,
          items: [{ name: newReq.itemName, qty: Number(newReq.qty), price: Number(newReq.price) }],
          totalAmount: Number(newReq.price) * Number(newReq.qty),
          specialInstructions: newReq.specialInstructions,
        }),
      });
      const data = await res.json();
      if (data?.request) {
        setRequests((prev) => [data.request, ...prev.filter((r) => r.id !== data.request.id)]);
      }
    } catch (err) {
      console.error('Error creating request:', err);
    }

    setShowCreateModal(false);
    setNewReq({
      room: '204',
      guest: 'Ananya Mehta',
      serviceType: 'Food & Dining',
      department: 'Kitchen / Room Service',
      itemName: '',
      qty: 1,
      price: 0,
      specialInstructions: '',
    });
  };

  return (
    <div>
      {/* Top Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
              Live Room Service Requests — All Suites
            </h2>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Room PMS Connected
            </span>
          </div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Multi-room dispatch feed synced in real-time with guest carts & suites ({requests.length} total active requests)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchRequests}
            title="Refresh requests from database"
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{isSyncing ? '⌛' : '↻'}</span>
            <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#7a0c24',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(122,12,36,0.2)',
            }}
          >
            <span>+</span>
            <span>Log Request For Any Room</span>
          </button>
        </div>
      </div>

      {/* Room Selection Filter Tabs */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Filter by Suite / Room:
          </span>
          <span style={{ fontSize: '12px', color: '#7a0c24', fontWeight: 700 }}>
            {selectedRoom === 'All' ? 'Showing All Hotel Rooms' : `Focused on Room ${selectedRoom}`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setSelectedRoom('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              border: selectedRoom === 'All' ? '1.5px solid #7a0c24' : '1px solid #cbd5e1',
              background: selectedRoom === 'All' ? '#7a0c24' : '#f8fafc',
              color: selectedRoom === 'All' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Rooms ({requests.length})
          </button>

          {roomOptions.map((roomNum) => {
            const count = requests.filter((r) => r.room === roomNum).length;
            const isSelected = selectedRoom === roomNum;
            return (
              <button
                key={roomNum}
                type="button"
                onClick={() => setSelectedRoom(roomNum)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: isSelected ? '1.5px solid #7a0c24' : '1px solid #cbd5e1',
                  background: isSelected ? '#7a0c24' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Suite {roomNum}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#475569',
                    fontSize: '10.5px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category & Status Filter Bar + Search */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px' }}>
        {/* Search */}
        <div style={{ flex: '1', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="🔍 Search requests by guest, item, room #, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              background: '#ffffff',
            }}
          />
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`admin-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
          {['All', 'New', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                border: 'none',
                background: selectedStatus === st ? '#ffffff' : 'transparent',
                color: selectedStatus === st ? '#0f172a' : '#64748b',
                boxShadow: selectedStatus === st ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              {selectedRoom === 'All' ? 'All Active Hotel Requests' : `Suite ${selectedRoom} Requests`} ({filteredRequests.length})
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Showing real-time PMS dispatches for room service, housekeeping, laundry, and concierge
            </div>
          </div>

          {selectedRoom !== 'All' && (
            <Link
              href={`/admin/invoices?room=${selectedRoom}`}
              style={{
                fontSize: '12.5px',
                color: '#7a0c24',
                fontWeight: 700,
                textDecoration: 'none',
                background: '#fef2f2',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
              }}
            >
              View Room {selectedRoom} Folio / Invoice →
            </Link>
          )}
        </div>

        {filteredRequests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛎️</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>No requests match the selected filters</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Try switching the room or resetting the search term.</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Room & Guest</th>
                <th>Service Details</th>
                <th>Special Request</th>
                <th>Department</th>
                <th>Billed Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{req.id}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{req.timestamp}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: '#7a0c24',
                          fontSize: '14px',
                          background: '#fff1f2',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #fecdd3',
                        }}
                      >
                        Room {req.room}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155', fontWeight: 600, marginTop: '3px' }}>
                      {req.guest}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.serviceType}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {req.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td style={{ maxWidth: '220px' }}>
                    {req.specialInstructions ? (
                      <div
                        style={{
                          fontSize: '11.5px',
                          background: '#fef3c7',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                        }}
                      >
                        📝 {req.specialInstructions}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>None</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      {req.department}
                    </span>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Staff: {req.assignedStaff}</div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                      {req.totalAmount > 0 ? `₹${req.totalAmount}` : 'Complimentary'}
                    </strong>
                    <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600 }}>
                      {req.billedToRoom ? '● Billed to Suite' : 'Pending'}
                    </div>
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
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setActiveModalRequest(req)}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Details
                      </button>
                      <a
                        href={`/?room=${req.room}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#fff1f2',
                          color: '#9f1239',
                          border: '1px solid #fecdd3',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title={`Open Guest Portal for Room ${req.room}`}
                      >
                        <span>Room {req.room}</span>
                        <span style={{ fontSize: '10px' }}>↗</span>
                      </a>
                      {req.status === 'New' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'In Progress')}
                          style={{
                            background: '#7a0c24',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Accept
                        </button>
                      )}
                      {req.status === 'In Progress' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Completed')}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {activeModalRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setActiveModalRequest(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                  Request {activeModalRequest.id}
                </h3>
                <span style={{ fontSize: '13px', color: '#7a0c24', fontWeight: 700 }}>
                  Room {activeModalRequest.room} · {activeModalRequest.guest}
                </span>
              </div>
              <button
                onClick={() => setActiveModalRequest(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Service Category: {activeModalRequest.serviceType} ({activeModalRequest.department})
              </div>
              {activeModalRequest.items.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                  <span>{i.qty}× {i.name}</span>
                  <strong>{i.price > 0 ? `₹${i.price * i.qty}` : 'Complimentary'}</strong>
                </div>
              ))}
            </div>

            {activeModalRequest.specialInstructions && (
              <div style={{ marginBottom: '16px', background: '#fef3c7', padding: '12px', borderRadius: '10px', fontSize: '12.5px', color: '#92400e' }}>
                <strong>Guest Special Instructions:</strong>
                <div>{activeModalRequest.specialInstructions}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <Link
                  href={`/admin/invoices?room=${activeModalRequest.room}`}
                  style={{ fontSize: '12px', color: '#7a0c24', fontWeight: 700, textDecoration: 'none' }}
                >
                  Open Room {activeModalRequest.room} Folio →
                </Link>
                <a
                  href={`/?room=${activeModalRequest.room}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700, textDecoration: 'none' }}
                >
                  Launch Guest Screen (Room {activeModalRequest.room}) ↗
                </a>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleUpdateStatus(activeModalRequest.id, 'In Progress')}
                  style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeModalRequest.id, 'Completed')}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Request For Any Room Modal */}
      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Log New Service Request
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Dispatch to any guest suite or hotel department
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Room Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Select Suite / Room:
                </label>
                <select
                  value={newReq.room}
                  onChange={(e) => handleRoomSelectForNewReq(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  {SUITE_ROOMS.map((r) => (
                    <option key={r.number} value={r.number}>
                      Room {r.number} — {r.name} ({r.guest})
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Guest Name:
                </label>
                <input
                  type="text"
                  value={newReq.guest}
                  onChange={(e) => setNewReq({ ...newReq, guest: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>

              {/* Department & Service Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Service Category:
                  </label>
                  <select
                    value={newReq.serviceType}
                    onChange={(e) => {
                      const type = e.target.value;
                      let dept = 'Kitchen / Room Service';
                      if (type === 'Housekeeping') dept = 'Housekeeping';
                      if (type === 'Laundry & Garment Care') dept = 'Laundry Care';
                      if (type === 'Cab Services') dept = 'Concierge / Chauffeur';
                      if (type === 'Shoe Care') dept = 'Housekeeping';
                      if (type === 'Luggage Handling') dept = 'Bell Desk / Concierge';
                      setNewReq({ ...newReq, serviceType: type, department: dept });
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Assigned Department:
                  </label>
                  <input
                    type="text"
                    value={newReq.department}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      fontSize: '13px',
                      color: '#64748b',
                    }}
                  />
                </div>
              </div>

              {/* Item Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Item / Service Description:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra Towels, Coffee, Ironing"
                    value={newReq.itemName}
                    onChange={(e) => setNewReq({ ...newReq, itemName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Qty:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newReq.qty}
                    onChange={(e) => setNewReq({ ...newReq, qty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Price (₹):
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newReq.price}
                    onChange={(e) => setNewReq({ ...newReq, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Guest Special Instructions:
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Deliver immediately, ring bell twice, no ice..."
                  value={newReq.specialInstructions}
                  onChange={(e) => setNewReq({ ...newReq, specialInstructions: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#7a0c24',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Dispatch to Room {newReq.room}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
