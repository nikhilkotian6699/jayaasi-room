'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ForbiddenState from '@/components/admin/ForbiddenState';

export default function StaffPage() {
  const { hasPermission, isOwner, apiFetch } = useAdminAuth();

  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [newDept, setNewDept] = useState('HOUSEKEEPING');

  if (!hasPermission('staff.read')) {
    return <ForbiddenState requiredPermission="staff.read" resourceTitle="Staff Management & RBAC Roster" />;
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([
        apiFetch('/api/v1/staff'),
        apiFetch('/api/v1/roles'),
      ]);
      const sData = await staffRes.json();
      const rData = await rolesRes.json();

      if (sData.success) setStaffList(sData.staff || []);
      if (rData.success) {
        setRoles(rData.roles || []);
        if (rData.roles?.length > 0 && !newRoleId) {
          const staffR = rData.roles.find((r) => r.name === 'STAFF_ADMIN') || rData.roles[0];
          setNewRoleId(staffR.id);
        }
      }
    } catch (err) {
      console.error('[StaffPage] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, newRoleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/v1/staff', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          roleId: newRoleId,
          department: newDept,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setActionSuccess(`Staff member "${data.user.name}" created and assigned role.`);
        loadData();
      } else {
        alert(data.error || 'Failed to create staff member');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await apiFetch('/api/v1/staff', {
        method: 'PATCH',
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Staff member status changed to ${nextStatus}.`);
        loadData();
      }
    } catch (err) {
      alert('Error updating staff status: ' + err.message);
    }
  };

  return (
    <div>
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
            Staff & Operational RBAC Assignments
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Section 8: User · Hotel · Department · Role · Permissions
          </p>
        </div>

        {hasPermission('staff.create') && (
          <button
            onClick={() => setModalOpen(true)}
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
            <span>+</span> Add Staff Member
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

      {/* Roster Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px' }}>Staff Member</th>
              <th style={{ padding: '12px 16px' }}>Assigned Role</th>
              <th style={{ padding: '12px 16px' }}>Operational Area / Dept</th>
              <th style={{ padding: '12px 16px' }}>Active Tasks</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((st) => (
              <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{st.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{st.email}</div>
                  {st.phone && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{st.phone}</div>}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: st.role === 'OWNER_ADMIN' ? '#fdf2f8' : '#eff6ff',
                      color: st.role === 'OWNER_ADMIN' ? '#9d174d' : '#1d4ed8',
                    }}
                  >
                    {st.role}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                  {st.department ? (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        fontSize: '11px',
                      }}
                    >
                      {st.department}
                    </span>
                  ) : (
                    'All Operational Areas'
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                  {st.activeTaskCount > 0 ? (
                    <span style={{ color: '#059669' }}>{st.activeTaskCount} active tasks</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Idle / None</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: st.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                      color: st.status === 'ACTIVE' ? '#047857' : '#b91c1c',
                    }}
                  >
                    {st.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  {st.role !== 'OWNER_ADMIN' && hasPermission('staff.disable') && (
                    <button
                      onClick={() => handleToggleStatus(st.id, st.status)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: st.status === 'ACTIVE' ? '#b91c1c' : '#059669',
                      }}
                    >
                      {st.status === 'ACTIVE' ? 'Disable Account' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {modalOpen && (
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Staff Member</h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Meera Joshi"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. meera@jayaasi.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Phone</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98230 00000"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Role</label>
                  <select
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="LAUNDRY">Laundry</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="FRONT_DESK">Front Desk</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7a0c24', color: '#fff', fontWeight: 600 }}
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
