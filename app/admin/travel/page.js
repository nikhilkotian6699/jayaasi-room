'use client';

import { nearbyPlaces, cabProviders } from '@/lib/mock-data';
import styles from './travel.module.css';

export default function TravelPage() {
  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Travel & Nearby Places</h1>
          <p className={styles.subtitle}>Help guests get around and discover the neighborhood.</p>
        </div>
        <button className="btn btn-primary">＋ Add a place</button>
      </div>

      <div className={styles.callout}>
        <div>
          <strong>Make rides easy for every guest</strong>
          <p>Open the cab provider with the hotel pickup location already filled in. Guests confirm and pay in their chosen app.</p>
        </div>
        <button className="btn btn-dark">Preview guest flow →</button>
      </div>

      <div className={styles.providerGrid}>
        {cabProviders.map((p) => (
          <article className={styles.providerCard} key={p.id}>
            <div className={styles.providerLogo} style={{ background: p.color === '#000' ? '#f2efed' : '#edf5e8', color: p.color }}>
              {p.logo}
            </div>
            <div className={styles.providerInfo}>
              <strong>{p.name}</strong>
              <p>{p.description}</p>
            </div>
            <button className={`switch ${p.enabled ? 'on' : ''}`} role="switch" aria-checked={p.enabled}></button>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Nearby places</h2>
            <p className="panel-subtitle">Helpful destinations shown in the guest app</p>
          </div>
        </div>
        <div className={styles.placeGrid}>
          {nearbyPlaces.map((p) => (
            <article className={styles.placeCard} key={p.id}>
              <strong>{p.icon} &nbsp; {p.name}</strong>
              <p>{p.distance} · {p.category}</p>
            </article>
          ))}
          <article className={styles.placeCard} style={{ borderStyle: 'dashed', cursor: 'pointer' }}>
            <strong>＋ &nbsp; Add nearby place</strong>
            <p>Show guests what is close</p>
          </article>
        </div>
      </section>
    </div>
  );
}
