'use client';

import { staff } from '@/lib/mock-data';
import styles from './staff.module.css';

export default function StaffPage() {
  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Staff & Access</h1>
          <p className={styles.subtitle}>Manage your team and control what each person can access.</p>
        </div>
        <button className="btn btn-primary">＋ Invite staff</button>
      </div>

      <div className={styles.callout}>
        <div>
          <strong>Role-based access keeps hotel data private</strong>
          <p>Team members only see requests and tools for their assigned role and department.</p>
        </div>
        <span className="status-badge status-completed">Admin access active</span>
      </div>

      <section className={`card ${styles.contentPanel}`}>
        <div className={styles.toolbar}>
          <strong className="panel-title">Hotel team · {staff.length} members</strong>
          <button className="btn btn-sm">Manage roles</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team member</th>
                <th>Role</th>
                <th>Department access</th>
                <th>Account</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className={styles.staffAvatar}>{t.initials}</span>
                    <span className="cell-primary">{t.name}</span>
                  </td>
                  <td>{t.title}</td>
                  <td>{t.department}</td>
                  <td>
                    <span className="status-badge status-completed">Active</span>
                  </td>
                  <td>
                    <button className="btn-ghost">Edit access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.roleGrid}>
        {[
          ['Hotel administrator', 'Everything in this hotel'],
          ['Manager', 'Hotel operations and reports'],
          ['Department staff', 'Assigned department requests'],
          ['Platform admin', 'All hotels and system settings'],
        ].map(([title, desc]) => (
          <article className={styles.roleCard} key={title}>
            <span className={styles.roleIcon}>♙</span>
            <span>
              <strong>{title}</strong>
              <small>{desc}</small>
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
