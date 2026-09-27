'use client';

import { analytics } from '@/lib/mock-data';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>A clear view of hotel service activity.</p>
        </div>
        <button className="btn">↓ Export report</button>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Requests this week</span>
            <span className="metric-icon">◷</span>
          </div>
          <div className="metric-value">186</div>
          <div className="metric-foot"><span className="up">↑ 14%</span> vs. last week</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Average response</span>
            <span className="metric-icon blue">◴</span>
          </div>
          <div className="metric-value">{analytics.avgResponse}</div>
          <div className="metric-foot"><span className="up">↓ 2 min</span> vs. last week</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Orders completed</span>
            <span className="metric-icon">&check;</span>
          </div>
          <div className="metric-value">{analytics.completionRate}%</div>
          <div className="metric-foot">175 of 186 requests</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Guest rating</span>
            <span className="metric-icon amber">★</span>
          </div>
          <div className="metric-value">{analytics.guestRating} / 5</div>
          <div className="metric-foot">{analytics.totalReviews} reviews this month</div>
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Requests by day</h2>
              <p className="panel-subtitle">Guest requests · this week</p>
            </div>
          </div>
          <div className={styles.miniBars}>
            {analytics.weeklyRequests.map((d) => (
              <span key={d.day} style={{ height: `${(d.thisWeek / 44) * 100}%` }}>
                <small>{d.day.charAt(0)}</small>
              </span>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Most requested services</h2>
              <p className="panel-subtitle">Based on this month</p>
            </div>
          </div>
          <div className={styles.serviceList}>
            {analytics.topServices.map((s) => (
              <div className={styles.serviceRow} key={s.name}>
                <div className={styles.serviceIcon}>{s.icon}</div>
                <div className={styles.serviceInfo}>
                  <strong>{s.name}</strong>
                  <small>{s.percentage}% of guest requests</small>
                </div>
                <span className="status-badge status-completed">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
