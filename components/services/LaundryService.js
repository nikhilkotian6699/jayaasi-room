'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function LaundryService() {
  const { addToCart, openCart, showToast, cartItemCount } = useApp();

  const [serviceType, setServiceType] = useState('Full Service');

  const [quantities, setQuantities] = useState({
    shirts: 1,
    blazers: 0,
    casual: 0,
    sports: 0,
    innerwear: 0,
  });

  const laundryOptions = [
    'Full Service',
    'Clothes Washing',
    'Ironing / Pressing',
    'Folding / Drying',
    'Dry Cleaning',
  ];

  const clothingItems = [
    {
      id: 'shirts',
      name: 'Shirts',
      image: '/images/laundry/cloth_shirts.png',
      price: 60,
    },
    {
      id: 'blazers',
      name: 'Blazers',
      image: '/images/laundry/cloth_blazers.png',
      price: 180,
    },
    {
      id: 'casual',
      name: 'Casual Wear',
      image: '/images/laundry/cloth_casual.png',
      price: 70,
    },
    {
      id: 'sports',
      name: 'Sports Wear',
      image: '/images/laundry/cloth_sports.png',
      price: 60,
    },
    {
      id: 'innerwear',
      name: 'Inner Wear',
      image: '/images/laundry/cloth_innerwear.png',
      price: 40,
    },
  ];

  const increment = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  const formatQty = (qty) => {
    if (qty < 10) return `0${qty}`;
    return `${qty}`;
  };

  const handleQuickOrder = () => {
    let addedCount = 0;
    clothingItems.forEach((item) => {
      const qty = quantities[item.id] || 0;
      if (qty > 0) {
        addToCart({
          id: `laundry-${item.id}-${serviceType.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${item.name} (${serviceType})`,
          category: 'Laundry Services',
          price: item.price,
          quantity: qty,
          image: item.image,
        });
        addedCount += qty;
      }
    });

    if (addedCount === 0) {
      showToast('Please select quantity for at least 1 clothing item');
      return;
    }

    openCart();
  };

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="Laundry Services" showBack backHref="/services" />

      <main className="fd-page-main" style={{ padding: '12px 14px 80px' }}>
        <div className="ld-modal-card" style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Header Bar */}
          <div className="ld-modal-header" style={{ padding: '12px 16px', borderBottom: '1px solid #f1f1f4' }}>
            <Link href="/services" className="fd-back-btn" aria-label="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            <h1 className="ld-header-title">Laundry Services</h1>
            <div style={{ width: '28px' }} />
          </div>

          {/* Service Mode Selector matching prompt: Clothes Washing, Ironing / Pressing, Folding / Drying, Dry Cleaning */}
          <div style={{ padding: '12px 16px 6px', overflowX: 'auto', display: 'flex', gap: '6px', scrollbarWidth: 'none' }}>
            {laundryOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setServiceType(opt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: serviceType === opt ? '1.5px solid #870f2b' : '1px solid #e2e8f0',
                  background: serviceType === opt ? '#fdf2f4' : '#ffffff',
                  color: serviceType === opt ? '#870f2b' : '#64748b',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Inner Content Card */}
          <div className="ld-section-card" style={{ padding: '10px 16px' }}>
            <h2 className="ld-section-title" style={{ fontSize: '13px', fontWeight: '800', color: '#18181b', margin: '0 0 10px' }}>
              Select Clothing ({serviceType})
            </h2>

            {/* List of items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {clothingItems.map((item) => {
                const qty = quantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#ffffff',
                      border: '1px solid #f1f1f4',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Left: Thumbnail & Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/service_img_suit.png';
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#18181b' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
                          ₹{item.price} · {serviceType}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper */}
                    <div className="cart-stepper-pill">
                      <button
                        type="button"
                        className="cart-stepper-btn cart-stepper-minus"
                        onClick={() => decrement(item.id)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="cart-stepper-count">{formatQty(qty)}</span>
                      <button
                        type="button"
                        className="cart-stepper-btn cart-stepper-plus"
                        onClick={() => increment(item.id)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
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
