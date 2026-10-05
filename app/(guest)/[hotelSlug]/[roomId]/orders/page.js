'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';
import { requests, orders } from '@/lib/mock-data';
import { statusClass, formatPrice } from '@/lib/utils';

export default function GuestOrdersPage() {
  const params = useParams() || {};
  const hotelSlug = params.hotelSlug || 'jayaasi-rooms';
  const roomId = params.roomId || '204';
  const baseUrl = `/${hotelSlug}/${roomId}`;
  const myRequests = requests.filter(r => r.room === roomId);
  const myOrders = orders.filter(o => o.room === roomId);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="guest-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#18191b',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '999px',
          zIndex: 999,
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Shared Luxury Header */}
      <GuestHeader hotelName="Hotel name" />

      {/* Main Content */}
      <main className="guest-main-body">
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '4px 0 16px',
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px', margin: 0 }}>
              My Orders & Requests
            </h1>
            <p style={{ fontSize: '11px', color: '#6d7280', margin: '2px 0 0' }}>
              Track live food orders & hotel service tickets
            </p>
          </div>

          <Link href={baseUrl} style={{
            fontSize: '11px',
            color: 'var(--guest-maroon)',
            fontWeight: '700',
            textDecoration: 'none',
            background: 'rgba(122, 12, 36, 0.08)',
            padding: '5px 12px',
            borderRadius: '999px',
          }}>
            ← Home
          </Link>
        </div>

        {/* Active Dining Orders */}
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 10px' }}>
            In-Room Dining Orders
          </h2>

          {myOrders.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              border: '1px solid #e9ecef',
            }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>No active food orders.</p>
              <Link
                href={`${baseUrl}/food`}
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  background: 'var(--guest-maroon)',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '14px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#1a1a1a' }}>Order #{order.id}</span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: order.status === 'Delivered' ? '#f0fdf4' : '#fdf3f5',
                      color: order.status === 'Delivered' ? '#166534' : 'var(--guest-maroon)',
                      border: `1px solid ${order.status === 'Delivered' ? '#bbf7d0' : '#f2cbd3'}`,
                    }}>
                      ● {order.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#4b5563', padding: '6px 0', borderBottom: '1px solid #f2f3f5' }}>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
                        <span>{it.name} × {it.qty}</span>
                        <span style={{ fontWeight: '700' }}>{formatPrice(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', fontWeight: '800' }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--guest-maroon)' }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Requests */}
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 10px' }}>
            Service & Concierge Requests
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '14px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a' }}>
                      {req.service}
                    </span>
                    <div style={{ fontSize: '11px', color: '#68707d', marginTop: '2px' }}>
                      {req.detail} · {req.department}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#fdf3f5',
                    color: 'var(--guest-maroon)',
                    border: '1px solid #f2cbd3',
                  }}>
                    {req.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: '#888' }}>
                  <span>Requested at: {req.time}</span>
                  <span style={{ color: 'var(--guest-maroon)', fontWeight: '700' }}>Staff Assigned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Shared Luxury Footer with Cart Active */}
      <GuestFooter activeTab="cart" />
    </div>
  );
}
