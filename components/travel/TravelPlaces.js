'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function TravelPlaces() {
  const { openCart, cartItemCount } = useApp();
  const [selectedTag, setSelectedTag] = useState('All');

  const places = [
    {
      id: 'tp-1',
      name: 'Aga Khan Palace',
      category: 'Historical',
      distance: '15 min (4.2 km)',
      desc: 'Majestic 19th-century Italian arches and spacious lawns with historical Gandhi memorial',
      image: '/images/card_cabs_clean.jpg',
      cabPrice: '₹180',
    },
    {
      id: 'tp-2',
      name: 'Koregaon Park Dining & Cafes',
      category: 'Dining',
      distance: '10 min (2.5 km)',
      desc: 'Vibrant tree-lined lanes offering artisanal bakeries, microbreweries, and global fine dining',
      image: '/images/card_food_clean.jpg',
      cabPrice: '₹120',
    },
    {
      id: 'tp-3',
      name: 'Shaniwar Wada Fort',
      category: 'Heritage',
      distance: '20 min (6.8 km)',
      desc: 'Historical 18th-century Maratha fortress with grand Delhi Gate and evening light & sound show',
      image: '/images/card_room_info_clean.jpg',
      cabPrice: '₹220',
    },
    {
      id: 'tp-4',
      name: 'Phoenix Marketcity Mall',
      category: 'Shopping',
      distance: '18 min (5.5 km)',
      desc: 'Premier luxury lifestyle, international designer boutiques, cinema, and culinary promenade',
      image: '/images/card_services_clean.jpg',
      cabPrice: '₹210',
    },
    {
      id: 'tp-5',
      name: 'Pune International Airport (PNQ)',
      category: 'Transit',
      distance: '30 min (9.5 km)',
      desc: 'Domestic & international flight terminals with hotel meet-and-assist transfer',
      image: '/images/service_img_cabs.png',
      cabPrice: '₹450',
    },
    {
      id: 'tp-6',
      name: 'Pune Junction Railway Station',
      category: 'Transit',
      distance: '16 min (4.8 km)',
      desc: 'Central railway transit hub connecting express trains across India',
      image: '/images/service_img_cabs.png',
      cabPrice: '₹190',
    },
  ];

  const filteredPlaces = selectedTag === 'All'
    ? places
    : places.filter((p) => p.category === selectedTag);

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="Travel Places" showBack backHref="/" />

      <main style={{ paddingBottom: '80px' }}>
        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #18191b 0%, #222a36 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '20px',
          margin: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div>
            <span style={{ fontSize: '10.5px', color: '#f5c46b', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Local City Guide
            </span>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 2px' }}>
              Explore Nearby Places
            </h1>
            <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: 0 }}>
              Curated attractions & destinations in Pune
            </p>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🧭
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 14px', scrollbarWidth: 'none' }}>
          {['All', 'Historical', 'Dining', 'Heritage', 'Shopping', 'Transit'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: selectedTag === tag ? '1.5px solid #870f2b' : '1px solid #e2e8f0',
                background: selectedTag === tag ? '#870f2b' : '#ffffff',
                color: selectedTag === tag ? '#ffffff' : '#64748b',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Destination Cards */}
        <div className="travel-places-grid">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid #f1f1f4',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={place.image}
                  alt={place.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/card_cabs_clean.jpg';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(6px)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}>
                  📍 {place.distance}
                </div>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#870f2b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {place.category}
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#18181b', margin: '2px 0 4px' }}>
                  {place.name}
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 12px', lineHeight: 1.4 }}>
                  {place.desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f4f4f5' }}>
                  <span style={{ fontSize: '11px', color: '#71717a' }}>
                    Cab Fare ~ <strong>{place.cabPrice}</strong>
                  </span>
                  <Link
                    href={`/cab?destination=${encodeURIComponent(place.name)}`}
                    style={{
                      background: 'linear-gradient(135deg, #870f2b 0%, #5d061a 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '999px',
                      padding: '7px 14px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Book Cab</span>
                    <span>›</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
