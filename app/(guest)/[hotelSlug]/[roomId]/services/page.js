'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';

export default function GuestServicesPage() {
  const baseUrl = '/jayaasi-rooms/204';
  const [toastMessage, setToastMessage] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedSubOption, setSelectedSubOption] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const services = [
    {
      id: 'luggage',
      name: 'Luggage Handling',
      image: '/images/service_card_luggage.png',
      action: 'modal',
      modalType: 'luggage',
    },
    {
      id: 'shoe',
      name: 'Shoe Care',
      image: '/images/service_card_shoe.png',
      action: 'modal',
      modalType: 'shoe',
    },
    {
      id: 'cabs',
      name: 'Cab services',
      image: '/images/service_card_cabs.png',
      action: 'link',
      href: `${baseUrl}/travel`,
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      image: '/images/service_card_housekeeping.png',
      action: 'link',
      href: `${baseUrl}/housekeeping`,
    },
    {
      id: 'food',
      name: 'Order Food',
      image: '/images/service_card_food.png',
      action: 'link',
      href: `${baseUrl}/food`,
    },
    {
      id: 'laundry',
      name: 'Laundry Services',
      image: '/images/service_card_laundry.png',
      action: 'link',
      href: `${baseUrl}/laundry`,
    },
  ];

  return (
    <div className="guest-screen">
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

      {/* Shared Luxury Header with 'services' page title */}
      <GuestHeader hotelName="Hotel name" pageTitle="services" />

      {/* Main 2-Column Services Grid matching the exact mockup */}
      <main className="guest-main-body" style={{ padding: '8px 14px 110px' }}>
        <div className="guest-services-grid">
          {services.map((svc) => {
            if (svc.action === 'link') {
              return (
                <Link
                  key={svc.id}
                  href={svc.href}
                  className="guest-service-card-btn"
                  title={`Open ${svc.name}`}
                >
                  <img
                    src={svc.image}
                    alt={svc.name}
                    className="guest-service-card-img"
                  />
                </Link>
              );
            }

            return (
              <button
                key={svc.id}
                type="button"
                className="guest-service-card-btn"
                onClick={() => {
                  setSelectedSubOption(null);
                  setActiveModal(svc.modalType);
                }}
                title={`Request ${svc.name}`}
              >
                <img
                  src={svc.image}
                  alt={svc.name}
                  className="guest-service-card-img"
                />
              </button>
            );
          })}
        </div>
      </main>

      {/* ─── MODAL: Luggage Handling ─────────────────────────────────── */}
      {activeModal === 'luggage' && (
        <div className="guest-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-header">
              <span className="guest-modal-title">🧳 Luggage Handling</span>
              <button className="guest-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 16px' }}>
              Request bellboy baggage assistance for Room 204.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'pickup', title: 'Pick up luggage from Room 204', desc: 'Bellboy will arrive within 5-10 mins' },
                { id: 'delivery', title: 'Deliver stored luggage to Room', desc: 'Baggage from reception cloakroom' },
                { id: 'checkout', title: 'Luggage help for Check-out', desc: 'Transfer bags to hotel lobby/taxi' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedSubOption(opt.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${selectedSubOption === opt.id ? 'var(--guest-maroon)' : '#e9ecef'}`,
                    background: selectedSubOption === opt.id ? '#fdf2f4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#222' }}>{opt.title}</div>
                  <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>{opt.desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('Bellboy dispatched to Room 204! Assistance on the way.');
              }}
              style={{
                width: '100%',
                marginTop: '18px',
                padding: '12px',
                background: 'linear-gradient(135deg, #870f2b 0%, #5d061a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(122, 12, 36, 0.3)',
              }}
            >
              Confirm Bellboy Request
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: Shoe Care ────────────────────────────────────────── */}
      {activeModal === 'shoe' && (
        <div className="guest-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="guest-modal-header">
              <span className="guest-modal-title">👞 Shoe Care & Polish</span>
              <button className="guest-modal-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 16px' }}>
              Complimentary luxury shoe shine and leather buffing service.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'express', title: 'Express Buff & Shine', desc: 'Ready in 30 minutes · Cleaned & polished' },
                { id: 'deep', title: 'Deep Leather Polish & Wax', desc: 'Premium wax gloss & protection' },
                { id: 'suede', title: 'Suede & Nubuck Gentle Brush', desc: 'Stain lift & dry brush treat' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedSubOption(opt.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${selectedSubOption === opt.id ? 'var(--guest-maroon)' : '#e9ecef'}`,
                    background: selectedSubOption === opt.id ? '#fdf2f4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#222' }}>{opt.title}</div>
                  <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>{opt.desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('Shoe care request placed! Staff will collect shoes from Room 204.');
              }}
              style={{
                width: '100%',
                marginTop: '18px',
                padding: '12px',
                background: 'linear-gradient(135deg, #870f2b 0%, #5d061a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(122, 12, 36, 0.3)',
              }}
            >
              Request Shoe Pickup
            </button>
          </div>
        </div>
      )}

      {/* Shared Luxury Footer with Services Active */}
      <GuestFooter activeTab="services" />
    </div>
  );
}
