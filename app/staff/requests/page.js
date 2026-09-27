'use client';

import { useState } from 'react';
import { requests } from '@/lib/mock-data';
import { statusClass } from '@/lib/utils';
import styles from './requests.module.css';

export default function StaffRequestsPage() {
  const [filter, setFilter] = useState('All');

  const filtered = requests.filter(r => {
    if (filter === 'All') return true;
    return r.department === filter;
  });

  return (
    <div className="animate-in">
      <h1 className={styles.title}>All Requests</h1>

      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        {['All', 'Housekeeping', 'Kitchen', 'Laundry', 'Maintenance'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <section className={`card ${styles.contentPanel}`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Request</th>
                <th>Guest</th>
                <th>Department</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="cell-primary">{r.room}</td>
                  <td>
                    <span className="cell-primary">{r.service}</span>
                    <span className="cell-secondary">{r.detail}</span>
                  </td>
                  <td>{r.guest}</td>
                  <td>{r.department}</td>
                  <td>{r.time}</td>
                  <td>
                    <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                  </td>
                  <td>
                    {r.status === 'New' && <button className="btn btn-sm btn-primary">Accept</button>}
                    {r.status === 'In Progress' && <button className="btn btn-sm">Complete</button>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7"><div className="empty-state">No requests in this department.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
