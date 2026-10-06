'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ForbiddenState from '@/components/admin/ForbiddenState';

export default function AnalyticsPage() {
  const { hasPermission, apiFetch } = useAdminAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!hasPermission('analytics.read') || !hasPermission('revenue.read')) {
    return (
      <ForbiddenState
        requiredPermission="revenue.read"
        resourceTitle="Revenue, Profit & Financial Analytics"
      />
    );
  }

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/analytics');
      const resData = await res.json();
      if (resData.success) {
        setData(resData.analytics);
      }
    } catch (err) {
      console.error('[AnalyticsPage] Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Executive Business & Operational Analytics
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          Section 1 & 3: Owner-Level Revenue · Room Utilization · QR Health Metrics · Staff Productivity
        </p>
      </div>

      {/* 4 Primary Financial & Operational KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Hotel Revenue
            </span>
            <span style={{ fontSize: '20px' }}>💰</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#7a0c24', marginTop: '6px' }}>
            ₹{Number(data?.business?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            Avg Order: ₹{data?.business?.averageOrderValue || 0}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Occupancy Rate
            </span>
            <span style={{ fontSize: '20px' }}>🏨</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginTop: '6px' }}>
            {data?.rooms?.occupancyRate || 0}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {data?.rooms?.occupied || 0} of {data?.rooms?.total || 0} suites occupied
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Active Guest Sessions
            </span>
            <span style={{ fontSize: '20px' }}>📱</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {data?.traffic?.activeGuestSessions || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {data?.traffic?.scansLast24h || 0} QR scans in last 24 hours
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Staff Task Velocity
            </span>
            <span style={{ fontSize: '20px' }}>⚡</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>
            {data?.operations?.taskCompletionRate || 0}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {data?.operations?.completedTasks || 0} completed · {data?.operations?.pendingTasks || 0} pending
          </div>
        </div>
      </div>

      {/* Deep Dive Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Room Status Matrix */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
            Suite Status Distribution
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Occupied (Guest In-Room)</span>
              <strong style={{ color: '#059669' }}>{data?.rooms?.occupied || 0} suites</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Available for Booking</span>
              <strong style={{ color: '#2563eb' }}>{data?.rooms?.available || 0} suites</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Cleaning / Maintenance</span>
              <strong style={{ color: '#d97706' }}>{data?.rooms?.maintenance || 0} suites</strong>
            </div>
          </div>
        </div>

        {/* QR Health Index */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
            QR Infrastructure Health (Section 10 & 14)
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Active Permanent QRs</span>
              <strong style={{ color: '#059669' }}>{data?.qrHealth?.totalActive || 0} / {data?.rooms?.total || 0} rooms</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Damage Replacement Requests</span>
              <strong style={{ color: '#dc2626' }}>{data?.qrHealth?.pendingReplacement || 0} ticket(s)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Replacements Completed</span>
              <strong style={{ color: '#475569' }}>{data?.qrHealth?.installedTotal || 0} installed</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
