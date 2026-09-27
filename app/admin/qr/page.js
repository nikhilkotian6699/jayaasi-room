'use client';

import { rooms } from '@/lib/mock-data';
import styles from './qr.module.css';

export default function QRPage() {
  const activeQR = rooms.filter(r => r.qrActive).length;

  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>QR Management</h1>
          <p className={styles.subtitle}>Generate and manage QR codes for each room.</p>
        </div>
        <div className={styles.headingActions}>
          <button className="btn">↓ Download all</button>
          <button className="btn btn-primary">＋ Generate QR</button>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Total QR codes</span>
            <span className="metric-icon">⊞</span>
          </div>
          <div className="metric-value">{rooms.length}</div>
          <div className="metric-foot">One per room</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Active</span>
            <span className="metric-icon">✓</span>
          </div>
          <div className="metric-value">{activeQR}</div>
          <div className="metric-foot">Ready for guests</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Disabled</span>
            <span className="metric-icon amber">⊘</span>
          </div>
          <div className="metric-value">{rooms.length - activeQR}</div>
          <div className="metric-foot">Not scanning</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Scans today</span>
            <span className="metric-icon blue">📊</span>
          </div>
          <div className="metric-value">47</div>
          <div className="metric-foot">Across all rooms</div>
        </div>
      </div>

      <section className={`card ${styles.contentPanel}`}>
        <div className={styles.toolbar}>
          <strong className="panel-title">Room QR codes</strong>
          <button className="btn btn-sm">Regenerate all</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Type</th>
                <th>QR Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="cell-primary">{room.number}</td>
                  <td>{room.type}</td>
                  <td>
                    <code className={styles.qrLink}>jayaasi.in/stay/{room.number.toLowerCase()}</code>
                  </td>
                  <td>
                    <span className={`status-badge ${room.qrActive ? 'status-completed' : 'status-cancelled'}`}>
                      {room.qrActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <button className="btn btn-sm">Download</button>
                      <button className="btn btn-sm">{room.qrActive ? 'Disable' : 'Enable'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
