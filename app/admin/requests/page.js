'use client';

import { useState } from 'react';
import { requests } from '@/lib/mock-data';
import { statusClass } from '@/lib/utils';
import styles from './requests.module.css';

export default function RequestsPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = requests.filter(r => {
    const matchesFilter = filter === 'All' || r.status === filter;
    const matchesSearch = !search || 
      [r.id, r.room, r.guest, r.service, r.department]
        .join(' ').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Guest Requests</h1>
          <p className={styles.subtitle}>Manage food orders, housekeeping and maintenance requests.</p>
        </div>
        <button className="btn btn-primary">＋ New request</button>
      </div>

      <section className={`card ${styles.contentPanel}`}>
        <div className={styles.toolbar}>
          <label className="search-field">
            ⌕
            <input
              placeholder="Search by room, guest or request"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="filter-tabs">
            {['All', 'New', 'In Progress', 'Completed'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>Guest</th>
                <th>Department</th>
                <th>Received</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">No requests match your filters.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="cell-primary">{r.service}</span>
                      <span className="cell-secondary">{r.id} · Room {r.room} · {r.detail}</span>
                    </td>
                    <td><span className="cell-primary">{r.guest}</span></td>
                    <td>{r.department}</td>
                    <td>{r.time}</td>
                    <td>
                      <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        {r.status === 'New' && (
                          <button className="btn btn-sm btn-primary">Accept</button>
                        )}
                        {r.status === 'In Progress' && (
                          <button className="btn btn-sm">Complete</button>
                        )}
                        {r.status === 'Completed' && (
                          <button className="btn btn-sm">Reopen</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
