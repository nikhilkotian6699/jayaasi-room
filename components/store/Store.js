'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function Store() {
  const { addToCart, openCart, cartItemCount } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const products = [
    {
      id: 'store-1',
      name: 'Executive Leather Notebook & Pen',
      category: 'Business',
      desc: 'Handcrafted full-grain leather journal with brass stylus',
      price: 850,
      image: '/images/card_services_clean.jpg',
    },
    {
      id: 'store-2',
      name: 'Jayaasi Signature Amber Aroma Diffuser',
      category: 'Fragrance',
      desc: 'Sandalwood & wild bergamot room essence',
      price: 1200,
      image: '/images/card_room_info_clean.jpg',
    },
    {
      id: 'store-3',
      name: 'Organic Himalayan Herbal Tea Gift Box',
      category: 'Gifts',
      desc: 'Selection of 6 aromatic single-estate wellness infusions',
      price: 650,
      image: '/images/card_food_clean.jpg',
    },
    {
      id: 'store-4',
      name: 'Mulberry Silk Sleep Mask & Pillow Mist',
      category: 'Comfort',
      desc: '100% pure silk blackout mask with French lavender mist',
      price: 950,
      image: '/images/service_img_suit.png',
    },
    {
      id: 'store-5',
      name: 'Universal 65W GaN Fast Travel Adapter',
      category: 'Business',
      desc: 'Works in 150+ countries with triple USB-C PD ports',
      price: 1100,
      image: '/images/service_img_cabs.png',
    },
    {
      id: 'store-6',
      name: 'Luxury Italian Leather Card Wallet',
      category: 'Business',
      desc: 'RFID blocking slim business card holder',
      price: 780,
      image: '/images/service_img_shoe.png',
    },
  ];

  const filteredProducts = selectedFilter === 'All'
    ? products
    : products.filter((p) => p.category === selectedFilter);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      category: 'Jayaasi Business Store',
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    openCart();
  };

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="Jayaasi Store" showBack backHref="/" />

      <main style={{ paddingBottom: '80px' }}>
        {/* Store Hero Banner matching design reference text */}
        <div className="store-hero-banner">
          <div>
            <span style={{ fontSize: '10.5px', color: '#f5c46b', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Official Hotel Boutique
            </span>
            <h1 className="store-hero-title" style={{ margin: '4px 0 2px' }}>
              Jayaasi Business Store
            </h1>
            <p className="store-hero-sub" style={{ margin: 0 }}>
              Gifts and business class products
            </p>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🛍️
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 14px', scrollbarWidth: 'none' }}>
          {['All', 'Business', 'Fragrance', 'Gifts', 'Comfort'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: selectedFilter === cat ? '1.5px solid #870f2b' : '1px solid #e2e8f0',
                background: selectedFilter === cat ? '#870f2b' : '#ffffff',
                color: selectedFilter === cat ? '#ffffff' : '#64748b',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="store-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="store-card">
              <div className="store-card-img-wrap">
                <img
                  src={product.image}
                  alt={product.name}
                  className="store-card-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/card_services_clean.jpg';
                  }}
                />
              </div>

              <div className="store-card-body">
                <span style={{ fontSize: '9px', fontWeight: '800', color: '#870f2b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {product.category}
                </span>
                <div className="store-card-title">{product.name}</div>
                <div className="store-card-sub">{product.desc}</div>

                <div className="store-card-footer">
                  <div className="store-card-price">₹{product.price}</div>
                  <button
                    type="button"
                    className="store-card-add-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Shop Now &gt;
                  </button>
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
