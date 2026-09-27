import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.landing}>
      <div className={styles.hero}>
        <div className={styles.brandMark}>j<span>.</span></div>
        <h1 className={styles.title}>
          <strong>jayaasi</strong>
          <small>ROOM</small>
        </h1>
        <p className={styles.subtitle}>
          Hotel operations platform
        </p>

        <div className={styles.portalGrid}>
          <Link href="/jayaasi-rooms/204" className={styles.portalCard}>
            <span className={styles.portalIcon}>📱</span>
            <strong>Guest Experience</strong>
            <small>Scan QR · Browse services · Order food</small>
          </Link>

          <Link href="/staff" className={styles.portalCard}>
            <span className={styles.portalIcon}>⚡</span>
            <strong>Staff Dashboard</strong>
            <small>Handle requests · Manage orders</small>
          </Link>

          <Link href="/admin" className={styles.portalCard}>
            <span className={styles.portalIcon}>⚙️</span>
            <strong>Admin Panel</strong>
            <small>Rooms · Services · Analytics · Settings</small>
          </Link>
        </div>

        <p className={styles.footNote}>
          One platform · Role-based interfaces · Shared backend
        </p>
      </div>
    </div>
  );
}
