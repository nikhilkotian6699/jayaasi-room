'use client';

import { useState } from 'react';
import { SERVICE_CATALOG } from '@/lib/admin-data';

export default function AdminServicesPage() {
  const [items, setItems] = useState(SERVICE_CATALOG);
  const [filter, setFilter] = useState('All');

  const toggleStock = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  };

  const categories = ['All', 'Food & Dining', 'Housekeeping', 'Laundry Care', 'Cab Services', 'Jayaasi Store'];

  const filteredItems = items.filter((item) =>
    filter === 'All' ? true : item.category === filter
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
            Service Catalog & In-Room Amenities
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Manage room service items, pricing, department dispatch, and live guest menu availability
          </span>
        </div>

        <button
          onClick={() => alert('New item form: Add dishes, services, or amenities to suite catalog.')}
          style={{
            background: '#7a0c24',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add New Item
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="admin-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`admin-filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Table */}
      <div className="admin-panel-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item / Service Name</th>
              <th>Category</th>
              <th>Fulfillment Department</th>
              <th>Tariff / Price</th>
              <th>Guest Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {item.id}</div>
                </td>
                <td>
                  <span
                    style={{
                      background: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#475569',
                      fontWeight: 600,
                    }}
                  >
                    {item.category}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                    {item.department}
                  </span>
                </td>
                <td>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                    {item.price > 0 ? `₹${item.price}` : 'Complimentary'}
                  </strong>
                </td>
                <td>
                  <span
                    style={{
                      background: item.inStock ? '#d1fae5' : '#fee2e2',
                      color: item.inStock ? '#065f46' : '#991b1b',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                    }}
                  >
                    {item.inStock ? '● Active / Available' : '○ Sold Out'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleStock(item.id)}
                    style={{
                      background: item.inStock ? '#fff1f2' : '#f0fdf4',
                      color: item.inStock ? '#be123c' : '#15803d',
                      border: `1px solid ${item.inStock ? '#fecdd3' : '#bbf7d0'}`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {item.inStock ? 'Mark Sold Out' : 'Mark Available'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
