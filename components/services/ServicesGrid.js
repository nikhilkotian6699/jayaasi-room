'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function ServicesGrid() {
  const { openCart, cartItemCount } = useApp();

  const services = [
    {
      id: 'luggage',
      name: 'Luggage Service',
      tag: 'Luggage Service',
      image: '/images/service_img_luggage.png',
      href: '/services/luggage',
    },
    {
      id: 'shoe',
      name: 'Shoe Care',
      tag: 'Shoe Care',
      image: '/images/service_img_shoe.png',
      href: '/services/shoe-care',
    },
    {
      id: 'cabs',
      name: 'Cab services',
      tag: 'Cab services',
      image: '/images/service_img_cabs.png',
      href: '/cab',
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      tag: 'Housekeeping',
      image: '/images/service_img_housekeeping.png',
      href: '/services/housekeeping',
    },
    {
      id: 'food',
      name: 'Food & Drinks',
      tag: 'Food & Drinks',
      image: '/images/service_img_food.png',
      href: '/services/food',
    },
    {
      id: 'suit',
      name: 'Suit & cloth care',
      tag: 'Suit & cloth care',
      image: '/images/service_img_suit.png',
      href: '/services/laundry',
    },
  ];

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="services" />

      <main className="sc-page-body">
        <div className="sc-grid">
          {services.map((svc) => (
            <Link
              key={svc.id}
              href={svc.href}
              className="sc-card"
              title={svc.name}
            >
              <div className="sc-img-wrap" style={{ position: 'relative' }}>
                <img
                  src={svc.image}
                  alt={svc.name}
                  className="sc-img"
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#111111',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {svc.tag}
                </span>
              </div>
              <div className="sc-btn-row">
                <span className="sc-btn">click here</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Floating Cart Button matching servicepage.png */}
        <div className="sc-cart-row">
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
