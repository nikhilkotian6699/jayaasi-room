'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function LuggageService() {
  const { addToCart, openCart, showToast, cartItemCount } = useApp();

  const [selectedServices, setSelectedServices] = useState({
    'luggage-carrying': true,
    'storage-delivery': false,
    'checkout-luggage': false,
  });

  const [bagCount, setBagCount] = useState(2);
  const [isFragile, setIsFragile] = useState(false);

  const luggageOptions = [
    {
      id: 'luggage-carrying',
      name: 'Luggage Carrying',
      desc: 'Bellboy baggage assistance to/from Room 204',
      icon: '/images/luggage service/luggage_icon.png',
    },
    {
      id: 'storage-delivery',
      name: 'Deliver Stored Luggage',
      desc: 'Deliver held bags from concierge cloakroom',
      icon: '/images/service_img_luggage.png',
    },
    {
      id: 'checkout-luggage',
      name: 'Check-out Baggage Transfer',
      desc: 'Assist baggage down to hotel porch / cab',
      icon: '/images/luggage service/luggage_icon.png',
    },
  ];

  const toggleOption = (id, name) => {
    setSelectedServices((prev) => {
      const next = !prev[id];
      if (next) {
        showToast(`Selected "${name}"`);
      }
      return { ...prev, [id]: next };
    });
  };

  const handleQuickOrder = () => {
    const active = luggageOptions.filter((opt) => selectedServices[opt.id]);
    if (active.length === 0) {
      showToast('Please select at least 1 luggage service');
      return;
    }

    active.forEach((opt) => {
      addToCart({
        id: `luggage-${opt.id}`,
        name: `${opt.name} (${bagCount} bags${isFragile ? ' · Fragile' : ''})`,
        category: 'Luggage Handling',
        price: 0,
        quantity: 1,
        image: '/images/service_img_luggage.png',
      });
    });

    openCart();
  };

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="Luggage Service" showBack backHref="/services" />

      <main className="fd-page-main" style={{ padding: '12px 14px 80px' }}>
        <div className="ld-modal-card" style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Header Bar */}
          <div className="ld-modal-header" style={{ padding: '12px 16px', borderBottom: '1px solid #f1f1f4' }}>
            <Link href="/services" className="fd-back-btn" aria-label="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            <h1 className="ld-header-title">Luggage Service</h1>
            <div style={{ width: '28px' }} />
          </div>

          {/* Inner Content Card */}
          <div className="ld-section-card" style={{ padding: '14px 16px' }}>
            <h2 className="ld-section-title" style={{ fontSize: '13px', fontWeight: '800', color: '#18181b', margin: '0 0 12px' }}>
              Select Luggage Service
            </h2>

            {/* Luggage Carrying Option matching reference */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {luggageOptions.map((opt) => {
                const isChecked = !!selectedServices[opt.id];
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id, opt.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: isChecked ? '#fff8f8' : '#ffffff',
                      border: `1.5px solid ${isChecked ? '#fecaca' : '#f1f1f4'}`,
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img
                          src={opt.icon}
                          alt={opt.name}
                          style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/service_img_luggage.png';
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#18181b' }}>
                          {opt.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
                          {opt.desc}
                        </div>
                      </div>
                    </div>

                    <div className={`hk-checkbox ${isChecked ? 'hk-checkbox--checked' : ''}`}>
                      {isChecked && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bag counter & Fragile tag */}
            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#222', display: 'block' }}>Number of Bags</span>
                <span style={{ fontSize: '11px', color: '#777' }}>Suitcases & carry-ons</span>
              </div>

              <div className="cart-stepper-pill" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="cart-stepper-btn cart-stepper-minus"
                  onClick={() => setBagCount((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease bag count"
                >
                  −
                </button>
                <span className="cart-stepper-count">{bagCount}</span>
                <button
                  type="button"
                  className="cart-stepper-btn cart-stepper-plus"
                  onClick={() => setBagCount((prev) => prev + 1)}
                  aria-label="Increase bag count"
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="fragile-check"
                type="checkbox"
                checked={isFragile}
                onChange={(e) => setIsFragile(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#870f2b' }}
              />
              <label htmlFor="fragile-check" style={{ fontSize: '12px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>
                Contains fragile / sensitive items (Special Bellboy Care)
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fd-bottom-actions" style={{ padding: '12px 16px 16px', display: 'flex', gap: '10px' }}>
            <Link href="/services" className="fd-btn-other" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
              Add other service
            </Link>

            <button
              type="button"
              className="fd-btn-quick-order"
              onClick={handleQuickOrder}
              style={{ flex: 1.2 }}
            >
              <img
                src="/images/food/icon_waiter_order.png"
                alt="Waiter"
                className="fd-waiter-icon"
                style={{ mixBlendMode: 'screen', width: '22px', height: '22px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="fd-quick-text">Quick order</span>
              <div className="fd-quick-play-circle">
                <div className="fd-quick-play-arrow" />
              </div>
            </button>
          </div>
        </div>

        {/* Floating Cart Button */}
        <div style={{ position: 'fixed', right: '16px', bottom: '86px', zIndex: 900 }}>
          <button
            type="button"
            className="gh-cart-btn"
            onClick={openCart}
            aria-label="Cart"
            style={{ position: 'relative', border: 'none', cursor: 'pointer' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span className="gh-cart-label">cart</span>
            {cartItemCount > 0 && (
              <span className="gf-cart-count-badge" style={{ top: '-4px', right: '-4px' }}>
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </main>
    </>
  );
}
