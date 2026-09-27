'use client';

import { useState } from 'react';
import { menuItems, menuCategories } from '@/lib/mock-data';
import { formatPrice, statusClass } from '@/lib/utils';
import styles from './menu.module.css';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All items');

  const filtered = activeCategory === 'All items'
    ? menuItems
    : menuItems.filter(m => m.category === activeCategory);

  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Food Menu</h1>
          <p className={styles.subtitle}>Keep your in-room dining menu fresh and up to date.</p>
        </div>
        <button className="btn btn-primary">＋ Add menu item</button>
      </div>

      <section className={`card ${styles.contentPanel}`}>
        <div className={styles.toolbar}>
          <label className="search-field">
            ⌕
            <input placeholder="Search menu items" />
          </label>
          <div className="filter-tabs">
            {['All items', ...menuCategories].map(f => (
              <button
                key={f}
                className={`filter-tab ${activeCategory === f ? 'active' : ''}`}
                onClick={() => setActiveCategory(f)}
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
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Type</th>
                <th>Availability</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="cell-primary">{m.emoji} &nbsp;{m.name}</span>
                    <span className="cell-secondary">{m.description}</span>
                  </td>
                  <td>{m.category}</td>
                  <td className="cell-primary">{formatPrice(m.price)}</td>
                  <td>
                    <span className={`status-badge ${m.veg ? 'status-completed' : 'status-occupied'}`}>
                      {m.veg ? 'Veg' : 'Non-veg'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${m.available ? 'status-completed' : 'status-cancelled'}`}>
                      {m.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost">Edit</button>
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
