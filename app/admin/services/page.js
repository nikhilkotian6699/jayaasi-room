'use client';

import { useState } from 'react';
import { services as initialServices } from '@/lib/mock-data';
import styles from './services.module.css';

export default function ServicesPage() {
  const [serviceList, setServiceList] = useState(initialServices);

  const toggleService = (idx) => {
    setServiceList(prev => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Services</h1>
          <p className={styles.subtitle}>Choose what guests can request from their room.</p>
        </div>
        <button className="btn btn-primary">＋ Add service</button>
      </div>

      <div className={styles.serviceGrid}>
        {serviceList.map((s, i) => (
          <article className={styles.serviceCard} key={s.id}>
            <div className={styles.serviceTop}>
              <span className={styles.serviceMark}>{s.icon}</span>
              <button
                className={`switch ${s.active ? 'on' : ''}`}
                role="switch"
                aria-checked={s.active}
                aria-label={`Toggle ${s.name}`}
                onClick={() => toggleService(i)}
              ></button>
            </div>
            <h3 className={styles.serviceName}>{s.name}</h3>
            <p className={styles.serviceDesc}>{s.description}</p>
            <div className={styles.serviceMeta}>
              <span>{s.department}</span>
              <span>{s.hours}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
