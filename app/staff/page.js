'use client';

import { requests, orders } from '@/lib/mock-data';
import { statusClass } from '@/lib/utils';
import styles from './dashboard.module.css';

export default function StaffDashboard() {
  const newRequests = requests.filter(r => r.status === 'New');
  const inProgress = requests.filter(r => r.status === 'In Progress');
  const housekeepingCount = requests.filter(r => r.department === 'Housekeeping' && r.status !== 'Completed').length;
  const laundryCount = requests.filter(r => r.department === 'Laundry' && r.status !== 'Completed').length;
  const maintenanceCount = requests.filter(r => r.department === 'Maintenance' && r.status !== 'Completed').length;

  return (
    <div className="animate-in">
      <h1 className={styles.title}>Today's Overview</h1>

      {/* Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Total Orders</span>
            <span className="metric-icon">♨</span>
          </div>
          <div className="metric-value">{orders.length + requests.length}</div>
          <div className="metric-foot">Orders & requests today</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Housekeeping</span>
            <span className="metric-icon blue">🧹</span>
          </div>
          <div className="metric-value">{String(housekeepingCount).padStart(2, '0')}</div>
          <div className="metric-foot">Active tasks</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Laundry</span>
            <span className="metric-icon purple">🧺</span>
          </div>
          <div className="metric-value">{String(laundryCount).padStart(2, '0')}</div>
          <div className="metric-foot">Pending pickups</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Maintenance</span>
            <span className="metric-icon amber">🔧</span>
          </div>
          <div className="metric-value">{String(maintenanceCount).padStart(2, '0')}</div>
          <div className="metric-foot">Open issues</div>
        </div>
      </div>

      {/* New requests */}
      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <div>
            <h2 className="panel-title">🔔 New Requests</h2>
            <p className="panel-subtitle">Needs immediate attention</p>
          </div>
        </div>

        {newRequests.length === 0 ? (
          <div className="empty-state">All caught up! No new requests.</div>
        ) : (
          newRequests.map(r => (
            <div className={styles.requestCard} key={r.id}>
              <div className={styles.requestLeft}>
                <div className={styles.requestRoom}>Room {r.room}</div>
                <div className={styles.requestService}>{r.service}</div>
                <div className={styles.requestMeta}>
                  {r.guest} · {r.time}
                  {r.priority === 'High' && <span className={styles.highBadge}>⚠ High</span>}
                </div>
              </div>
              <button className="btn btn-primary">Accept</button>
            </div>
          ))
        )}
      </section>

      {/* In progress */}
      {inProgress.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">⏳ In Progress</h2>
              <p className="panel-subtitle">Currently being handled</p>
            </div>
          </div>
          {inProgress.map(r => (
            <div className={styles.requestCard} key={r.id}>
              <div className={styles.requestLeft}>
                <div className={styles.requestRoom}>Room {r.room}</div>
                <div className={styles.requestService}>{r.service}</div>
                <div className={styles.requestMeta}>{r.guest} · {r.time}</div>
              </div>
              <button className="btn">Complete</button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
