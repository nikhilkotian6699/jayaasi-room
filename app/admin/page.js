'use client';

import Link from 'next/link';
import { requests, analytics } from '@/lib/mock-data';
import { statusClass, getGreeting } from '@/lib/utils';
import styles from './overview.module.css';

export default function AdminOverview() {
  const openRequests = requests.filter(r => r.status === 'New').length;
  const inProgress = requests.filter(r => r.status === 'In Progress').length;
  const greeting = getGreeting();

  return (
    <div className="animate-in">
      {/* Page heading */}
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>{greeting}, Arjun 👋</h1>
          <p className={styles.subtitle}>Here's what's happening at your hotel today.</p>
        </div>
        <div className={styles.headingActions}>
          <Link href="/jayaasi-rooms/204" className="btn">
            <span>◉</span> Guest preview
          </Link>
          <Link href="/admin/rooms" className="btn btn-primary">
            <span>＋</span> Manage rooms
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Occupancy</span>
            <span className="metric-icon">▤</span>
          </div>
          <div className="metric-value">{analytics.occupancy}%</div>
          <div className="metric-foot"><span className="up">↑ 6%</span> vs. last week</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Active requests</span>
            <span className="metric-icon amber">◷</span>
          </div>
          <div className="metric-value">{String(openRequests + inProgress).padStart(2, '0')}</div>
          <div className="metric-foot"><span className="up">{openRequests} need attention</span></div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Today's orders</span>
            <span className="metric-icon blue">♨</span>
          </div>
          <div className="metric-value">{analytics.todayOrders}</div>
          <div className="metric-foot"><span className="up">↑ 12%</span> vs. yesterday</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Guest satisfaction</span>
            <span className="metric-icon purple">♡</span>
          </div>
          <div className="metric-value">{analytics.guestRating} <span style={{ fontSize: 13, color: '#b88645' }}>★</span></div>
          <div className="metric-foot">From {analytics.totalReviews} guest reviews</div>
        </div>
      </div>

      {/* Charts + Latest Requests */}
      <div className={styles.overviewGrid}>
        {/* Service activity chart */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Service activity</h2>
              <p className="panel-subtitle">Requests and orders · this week</p>
            </div>
          </div>
          <div className={styles.chartLegend}>
            <span><i className={styles.legendDot}></i> This week</span>
            <span><i className={`${styles.legendDot} ${styles.legendDotMuted}`}></i> Last week</span>
          </div>
          <div className={styles.chart}>
            <div className={styles.chartY}>
              {['40', '30', '20', '10', '0'].map(v => <span key={v}>{v}</span>)}
            </div>
            <div className={styles.chartLines}>
              {[0, 1, 2, 3, 4].map(i => <i key={i}></i>)}
            </div>
            <div className={styles.bars}>
              {analytics.weeklyRequests.map((d) => (
                <div className={styles.barGroup} key={d.day}>
                  <i className={styles.bar} style={{ height: `${(d.lastWeek / 44) * 100}%` }}></i>
                  <i className={`${styles.bar} ${styles.barMain}`} style={{ height: `${(d.thisWeek / 44) * 100}%` }}></i>
                  <small className={styles.barLabel}>{d.day}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest requests */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Latest requests</h2>
              <p className="panel-subtitle">Stay on top of what guests need</p>
            </div>
            <Link href="/admin/requests" className="btn-ghost">View all →</Link>
          </div>
          <div className={styles.requestList}>
            {requests.slice(0, 4).map((r) => (
              <div className={styles.requestRow} key={r.id}>
                <div className={styles.requestIcon}>{r.icon}</div>
                <div className={styles.requestInfo}>
                  <strong>{r.service} · Room {r.room}</strong>
                  <small>{r.guest} · {r.time}</small>
                </div>
                <span className={`status-badge ${statusClass(r.status)}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <div className={styles.quickGrid}>
        {[
          { icon: '＋', title: 'Add a room', desc: 'Update inventory', href: '/admin/rooms' },
          { icon: '✳', title: 'Edit services', desc: 'Manage guest services', href: '/admin/services' },
          { icon: '⌖', title: 'Cab settings', desc: 'Uber & Ola links', href: '/admin/travel' },
          { icon: '♙', title: 'Invite staff', desc: 'Manage team access', href: '/admin/staff' },
        ].map((q) => (
          <Link key={q.href} href={q.href} className={styles.quickCard}>
            <span className={styles.quickIcon}>{q.icon}</span>
            <span>
              <strong>{q.title}</strong>
              <small>{q.desc}</small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
