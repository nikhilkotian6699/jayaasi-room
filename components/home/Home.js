'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function HomeView() {
  const { openCart, cartItemCount, showToast } = useApp();

  const serviceCards = [
    {
      id: 'food',
      label: 'Order Food',
      image: '/images/card_food_clean.jpg',
      href: '/services/food',
    },
    {
      id: 'room-info',
      label: 'Room information',
      image: '/images/card_room_info_clean.jpg',
      href: '/room',
    },
    {
      id: 'services',
      label: 'Room Services',
      image: '/images/card_services_clean.jpg',
      href: '/services',
    },
    {
      id: 'travel',
      label: 'Explore near by place',
      image: '/images/card_cabs_clean.jpg',
      href: '/travel',
    },
  ];

  return (
    <>
      {/* Header */}
      <MobileHeader hotelName="Hotel name" />

      {/* Main Body */}
      <main className="gh-home-body">
        {/* ─── Hero Card matching screenshot ───────────────── */}
        <div className="gh-hero-wrap">
          <div className="gh-hero-card">
            <img
              src="/images/hero_exact_crop.png"
              alt="Room Service"
              className="gh-hero-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/room home page/hero_exact_crop.png';
              }}
            />

            {/* Clickable CTA button overlay */}
            <Link
              href="/services/food"
              className="gh-hero-cta-hitbox"
              aria-label="Order Room Service Now"
            />

            {/* Left / Right chevron hitboxes */}
            <button
              type="button"
              className="gh-hero-arrow-btn gh-hero-arrow-prev"
              aria-label="Previous"
              onClick={() => showToast('Luxury Business Suite Dining')}
            />
            <button
              type="button"
              className="gh-hero-arrow-btn gh-hero-arrow-next"
              aria-label="Next"
              onClick={() => showToast('Special Chef Curated Menu')}
            />
          </div>
        </div>

        {/* ─── 2×2 Service Cards Grid ───────────────────────────────── */}
        <div className="gh-cards-grid">
          {serviceCards.map((card) => (
            <Link key={card.id} href={card.href} className="gh-card">
              <img
                src={card.image}
                alt={card.label}
                className="gh-card-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `/images/room home page/${card.image.split('/').pop()}`;
                }}
              />
              <div className="gh-card-overlay" />
              <span className="gh-card-badge">{card.label}</span>
              <span className="gh-card-arrow">›</span>
            </Link>
          ))}
        </div>

        {/* ─── Jayaasi Foundation Banner + Floating Cart Button ────── */}
        <div className="gh-bottom-row">
          {/* Foundation banner pill */}
          <div className="gh-foundation-pill">
            <img
              src="/images/foundation_photo.png"
              alt="Jayaasi Foundation"
              className="gh-foundation-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/room home page/foundation_photo.png';
              }}
            />
            <div className="gh-foundation-text">
              <span className="gh-foundation-name">Jayaasi Foundation</span>
              <span className="gh-foundation-sub">help people for food</span>
            </div>
            <button
              type="button"
              className="gh-donate-btn"
              onClick={() => showToast('Thank you for supporting Jayaasi Foundation! ❤️')}
            >
              Donate Now
            </button>
          </div>

          {/* Floating Cart button */}
          <button
            type="button"
            className="gh-cart-btn"
            onClick={openCart}
            aria-label="Open service cart"
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
