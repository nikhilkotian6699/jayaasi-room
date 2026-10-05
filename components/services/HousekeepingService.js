'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function HousekeepingService() {
  const { addToCart, openCart, showToast, cartItemCount } = useApp();

  const [selectedItems, setSelectedItems] = useState({
    'room-cleaning': true,
    'bed-making': true,
    'bathroom': true,
    'towel': true,
    'toiletries': true,
    'garbage': true,
    'drinking-water': true,
    'on-request': true,
  });

  const housekeepingItems = [
    {
      id: 'room-cleaning',
      name: 'Room Cleaning',
      line1: 'Room',
      line2: 'Cleaning',
      icon: '/images/house keeping /hk_room_cleaning.png',
    },
    {
      id: 'bed-making',
      name: 'Bed Making & Linen Changing',
      line1: 'Bed Making &',
      line2: 'Linen Changing',
      icon: '/images/house keeping /hk_bed_making.png',
    },
    {
      id: 'bathroom',
      name: 'Bathroom Cleaning & Sanitization',
      line1: 'Bathroom',
      line2: 'Cleaning &',
      line3: 'Sanitization',
      icon: '/images/house keeping /hk_bathroom.png',
    },
    {
      id: 'towel',
      name: 'Towel Replacement',
      line1: 'Towel',
      line2: 'Replacement',
      icon: '/images/house keeping /hk_towel.png',
    },
    {
      id: 'toiletries',
      name: 'Toiletries Replenishment',
      line1: 'Toiletries',
      line2: 'Replenishment',
      icon: '/images/house keeping /hk_toiletries.png',
    },
    {
      id: 'garbage',
      name: 'Garbage Removal',
      line1: 'Garbage',
      line2: 'Removal',
      icon: '/images/house keeping /hk_garbage.png',
    },
    {
      id: 'drinking-water',
      name: 'Drinking Water Refill',
      line1: 'Drinking',
      line2: 'Water Refill',
      icon: '/images/house keeping /hk_drinking_water.png',
    },
    {
      id: 'on-request',
      name: 'On-Request Cleaning',
      line1: 'On-Request',
      line2: 'Cleaning',
      icon: '/images/house keeping /hk_on_request.png',
    },
  ];

  const toggleItem = (id, name) => {
    setSelectedItems((prev) => {
      const next = !prev[id];
      if (next) {
        showToast(`Selected "${name}"`);
      }
      return { ...prev, [id]: next };
    });
  };

  const handleQuickOrder = () => {
    const selected = housekeepingItems.filter((item) => selectedItems[item.id]);
    if (selected.length === 0) {
      showToast('Please select at least 1 housekeeping service');
      return;
    }

    selected.forEach((item) => {
      addToCart({
        id: `hk-${item.id}`,
        name: item.name,
        category: 'Housekeeping',
        price: 0,
        quantity: 1,
        image: item.icon,
      });
    });

    openCart();
  };

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="House keeping" showBack backHref="/services" />

      <main className="fd-page-main" style={{ padding: '12px 14px 80px' }}>
        <div className="ld-modal-card" style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Header Bar */}
          <div className="ld-modal-header" style={{ padding: '12px 16px', borderBottom: '1px solid #f1f1f4' }}>
            <Link href="/services" className="fd-back-btn" aria-label="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            <h1 className="ld-header-title">House keeping</h1>
            <div style={{ width: '28px' }} />
          </div>

          {/* Inner Content Card */}
          <div className="ld-section-card" style={{ padding: '14px 16px' }}>
            <h2 className="ld-section-title" style={{ fontSize: '14px', fontWeight: '800', color: '#18181b', margin: '0 0 10px' }}>
              Select Housekeeping Services
            </h2>

            {/* 2-Column Grid */}
            <div className="hk-grid">
              {housekeepingItems.map((item) => {
                const isChecked = !!selectedItems[item.id];
                return (
                  <div
                    key={item.id}
                    className="hk-card"
                    onClick={() => toggleItem(item.id, item.name)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                  >
                    <div className="hk-card-left">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="hk-card-icon"
                      />
                      <div className="hk-card-label">
                        <div>{item.line1}</div>
                        <div>{item.line2}</div>
                        {item.line3 && <div>{item.line3}</div>}
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
