'use client';

import { rooms } from '@/lib/mock-data';
import { statusClass } from '@/lib/utils';
import styles from './rooms.module.css';

export default function RoomsPage() {
  const totalRooms = rooms.length;
  const occupied = rooms.filter(r => r.status === 'Occupied').length;
  const available = rooms.filter(r => r.status === 'Available').length;
  const needAttention = rooms.filter(r => ['Cleaning', 'Maintenance'].includes(r.status)).length;

  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Rooms</h1>
          <p className={styles.subtitle}>Room status and guest stay at a glance.</p>
        </div>
        <button className="btn btn-primary">＋ Add room</button>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Total rooms</span>
            <span className="metric-icon">▤</span>
          </div>
          <div className="metric-value">{totalRooms}</div>
          <div className="metric-foot">Across 4 room types</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Occupied</span>
            <span className="metric-icon blue">▣</span>
          </div>
          <div className="metric-value">{occupied}</div>
          <div className="metric-foot">{Math.round((occupied / totalRooms) * 100)}% occupancy</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Ready to check in</span>
            <span className="metric-icon">✓</span>
          </div>
          <div className="metric-value">{available}</div>
          <div className="metric-foot">Rooms ready for guests</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Need attention</span>
            <span className="metric-icon amber">⚒</span>
          </div>
          <div className="metric-value">{needAttention}</div>
          <div className="metric-foot">Cleaning or maintenance</div>
        </div>
      </div>

      <div className={styles.roomGrid}>
        {rooms.map((room) => (
          <article className={styles.roomCard} key={room.id}>
            <div className={styles.roomCardTop}>
              <div>
                <div className={styles.roomNumber}>{room.number}</div>
                <div className={styles.roomType}>{room.type}</div>
              </div>
              <span className={`status-badge ${statusClass(room.status)}`}>{room.status}</span>
            </div>
            <div className={styles.roomCardBottom}>
              <span className={styles.roomGuest}>{room.guest || '—'}</span>
              <button className="btn-ghost">Details →</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
