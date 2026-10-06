'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function TasksPage() {
  const { isOwner, isStaff, user, department, apiFetch } = useAdminAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeCommentTaskId, setActiveCommentTaskId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('HOUSEKEEPING');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [newRoomNumber, setNewRoomNumber] = useState('204');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('[TasksPage] Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await apiFetch(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Task status updated to ${newStatus}.`);
        loadTasks();
      } else {
        alert(data.error || 'Failed to update task status');
      }
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const handleAddComment = async (taskId) => {
    if (!commentText.trim()) return;
    try {
      const res = await apiFetch(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ comment: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText('');
        setActiveCommentTaskId(null);
        setActionSuccess('Comment posted to task.');
        loadTasks();
      }
    } catch (err) {
      alert('Error posting comment: ' + err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const roomsRes = await apiFetch('/api/v1/rooms');
      const roomsData = await roomsRes.json();
      const room = roomsData.rooms?.find((r) => r.roomNumber === newRoomNumber);

      const res = await apiFetch('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          taskType: newType,
          priority: newPriority,
          roomId: room?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        setActionSuccess(`Task "${data.task.title}" created successfully.`);
        loadTasks();
      }
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
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
            {isStaff ? 'My Operational Tasks' : 'Hotel Staff Task Dispatch'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {isStaff
              ? `Filtered for ${user?.name} · Department: ${department}`
              : 'Complete hotel operations dispatch across Housekeeping, Maintenance, and F&B'}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setCreateModalOpen(true)}
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
            <span>+</span> Assign New Task
          </button>
        )}
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

      {/* Filter Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: '8px' }}>Status:</span>
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: filterStatus === st ? '1px solid #7a0c24' : '1px solid #cbd5e1',
                background: filterStatus === st ? '#7a0c24' : '#f8fafc',
                color: filterStatus === st ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '6px',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: '8px' }}>Priority:</span>
          {['ALL', 'URGENT', 'HIGH', 'NORMAL', 'LOW'].map((pr) => (
            <button
              key={pr}
              onClick={() => setFilterPriority(pr)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: filterPriority === pr ? '1px solid #0f172a' : '1px solid #cbd5e1',
                background: filterPriority === pr ? '#0f172a' : '#f8fafc',
                color: filterPriority === pr ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '6px',
              }}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '60px 20px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <span style={{ fontSize: '32px' }}>📋</span>
          <h3 style={{ margin: '8px 0 4px', fontSize: '16px', color: '#1e293b' }}>No Tasks Matching Filter</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>All assignments for your active role have been addressed.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredTasks.map((t) => {
            const priorityColors = {
              URGENT: { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' },
              HIGH: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
              NORMAL: { bg: '#f8fafc', text: '#475569', border: '#cbd5e1' },
              LOW: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
            };
            const pc = priorityColors[t.priority] || priorityColors.NORMAL;

            return (
              <div
                key={t.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: pc.bg,
                          color: pc.text,
                          border: `1px solid ${pc.border}`,
                        }}
                      >
                        {t.priority}
                      </span>

                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        {t.taskType}
                      </span>

                      {t.room && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#fff1f2',
                            color: '#9f1239',
                          }}
                        >
                          🚪 Room {t.room.roomNumber} ({t.room.floor})
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                      {t.title}
                    </h3>

                    {t.description && (
                      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                        {t.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                      <span>👤 Assignee: <strong>{t.assignee?.name || 'Unassigned'}</strong></span>
                      <span>·</span>
                      <span>Created: {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {t.completedAt && (
                        <>
                          <span>·</span>
                          <span style={{ color: '#059669', fontWeight: 600 }}>
                            ✓ Completed {new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status & Quick Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {t.status !== 'IN_PROGRESS' && t.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#1e293b',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Start Task
                        </button>
                      )}

                      {t.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                          style={{
                            padding: '7px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#059669',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Mark Completed
                        </button>
                      )}

                      <button
                        onClick={() => setActiveCommentTaskId(activeCommentTaskId === t.id ? null : t.id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        💬 Comment ({t.comments?.length || 0})
                      </button>
                    </div>

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          t.status === 'COMPLETED'
                            ? '#ecfdf5'
                            : t.status === 'IN_PROGRESS'
                            ? '#eff6ff'
                            : '#fffbeb',
                        color:
                          t.status === 'COMPLETED'
                            ? '#047857'
                            : t.status === 'IN_PROGRESS'
                            ? '#1d4ed8'
                            : '#b45309',
                      }}
                    >
                      ● {t.status}
                    </span>
                  </div>
                </div>

                {/* Comment Box */}
                {activeCommentTaskId === t.id && (
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    {t.comments?.length > 0 && (
                      <div style={{ marginBottom: '12px', display: 'grid', gap: '8px' }}>
                        {t.comments.map((c) => (
                          <div
                            key={c.id}
                            style={{
                              background: '#f8fafc',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <strong>{c.user?.name}:</strong> {c.comment}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Add operational notes or completion details..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(t.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#7a0c24',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {createModalOpen && (
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Assign Operational Task</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Turn-down and linen change"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Room Number</label>
                <input
                  type="text"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="e.g. 204"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="ROOM_SERVICE">Room Service</option>
                    <option value="LAUNDRY">Laundry</option>
                    <option value="AMENITY">Amenity</option>
                    <option value="QR_REPLACEMENT">QR Replacement</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Instructions</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details for the operational team..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7a0c24', color: '#fff', fontWeight: 600 }}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
