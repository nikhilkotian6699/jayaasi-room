'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function FoodService() {
  const router = useRouter();
  const { addToCart, openCart, showToast, cartItemCount } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('south-indian');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Local quantities
  const [quantities, setQuantities] = useState({
    'masala-dosa': 3,
    'plain-dosa': 0,
    'mysore-dosa': 0,
    'bedra-dosa': 0,
    'chicken-samosa': 1,
    'chicken-soma': 0,
    'veg-fried-rice': 0,
    'butter-chicken': 0,
    'cold-coffee': 0,
  });

  const categories = [
    { id: 'chinese', name: 'Chinese', image: '/images/food/cat_chinese.png' },
    { id: 'south-indian', name: 'South Indian', image: '/images/food/cat_south_indian.png' },
    { id: 'north-indian', name: 'North Indian', image: '/images/food/cat_north_indian.png' },
    { id: 'arabian', name: 'Arabian', image: '/images/food/cat_arabian.png' },
  ];

  const foodItems = [
    {
      id: 'masala-dosa',
      name: 'Masala Dosa',
      type: 'VEG',
      price: 120,
      category: 'south-indian',
      image: '/images/food/dish_masala_dosa.png',
    },
    {
      id: 'plain-dosa',
      name: 'Plain Dosa',
      type: 'VEG',
      price: 120,
      category: 'south-indian',
      image: '/images/food/dish_plain_dosa.png',
    },
    {
      id: 'mysore-dosa',
      name: 'mysore Dosa',
      type: 'VEG',
      price: 120,
      category: 'south-indian',
      image: '/images/food/dish_mysore_dosa.png',
    },
    {
      id: 'bedra-dosa',
      name: 'Bedra Dosa',
      type: 'VEG',
      price: 120,
      category: 'south-indian',
      image: '/images/food/dish_bedra_dosa.png',
    },
    {
      id: 'chicken-samosa',
      name: 'Chicken samosa',
      type: 'NON VEG',
      price: 120,
      category: 'south-indian',
      image: '/images/food/dish_chicken_samosa.png',
    },
    {
      id: 'chicken-soma',
      name: 'Chicken soma',
      type: 'NON VEG',
      price: 120,
      category: 'south-indian',
      image: '/images/food/dish_chicken_soma.png',
    },
    {
      id: 'veg-fried-rice',
      name: 'Vegetable Fried Rice',
      type: 'VEG',
      price: 120,
      category: 'chinese',
      image: '/images/service cart pop up down /cart_fried_rice.png',
    },
    {
      id: 'butter-chicken',
      name: 'Butter Chicken',
      type: 'NON VEG',
      price: 480,
      category: 'north-indian',
      image: '/images/food/dish_north_indian_cat.png',
    },
    {
      id: 'cold-coffee',
      name: 'Cold Coffee',
      type: 'VEG',
      price: 180,
      category: 'arabian',
      image: '/images/food/cat_arabian.png',
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

  const filteredItems = foodItems.filter((item) => {
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return item.category === selectedCategory;
  });

  const handleQuickOrder = () => {
    let addedCount = 0;
    Object.entries(quantities).forEach(([itemId, qty]) => {
      if (qty > 0) {
        const item = foodItems.find((f) => f.id === itemId);
        if (item) {
          addToCart({
            id: item.id,
            name: item.name,
            category: 'Food & Beverage',
            price: item.price,
            quantity: qty,
            image: item.image,
          });
          addedCount += qty;
        }
      }
    });

    if (addedCount === 0) {
      showToast('Please select quantity for at least 1 dish');
      return;
    }

    openCart();
  };

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="Food & Drinks" showBack backHref="/services" />

      <main className="fd-page-main" style={{ padding: '12px 14px 80px' }}>
        <div className="ld-modal-card" style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Header Bar inside card */}
          <div className="ld-modal-header" style={{ padding: '12px 16px', borderBottom: '1px solid #f1f1f4' }}>
            <Link href="/services" className="fd-back-btn" aria-label="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            <h1 className="ld-header-title">Food & Drinks</h1>

            <button
              type="button"
              className="fd-search-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search food"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          {/* Search bar if toggled */}
          {isSearchOpen && (
            <div style={{ padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Categories Horizontal Carousel */}
          <div className="fd-categories-wrap" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`fd-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  flexShrink: 0,
                  width: '74px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedCategory === cat.id ? '2px solid #870f2b' : '1px solid #e2e8f0',
                  boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(135,15,43,0.2)' : 'none',
                  background: selectedCategory === cat.id ? '#870f2b' : '#ffffff',
                  textAlign: 'center',
                }}
              >
                <div style={{ height: '48px', overflow: 'hidden' }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{
                  padding: '4px 2px',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: selectedCategory === cat.id ? '#ffffff' : '#333333',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {cat.name}
                </div>
              </div>
            ))}
          </div>

          {/* Section Sub-header */}
          <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#870f2b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {selectedCategory === 'south-indian' ? 'DOSA & SPECIALS' : `${selectedCategory.toUpperCase()} MENU`}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#870f2b' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d1d5db' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d1d5db' }} />
            </div>
          </div>

          {/* Dish List matching screenshot */}
          <div className="fd-dish-list" style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredItems.map((dish) => {
              const qty = quantities[dish.id] || 0;
              return (
                <div
                  key={dish.id}
                  className="fd-dish-card"
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
                  {/* Left: Dish Image & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={dish.image}
                        alt={dish.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/food/dish_masala_dosa.png';
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dish.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: dish.type === 'VEG' ? '#ecfdf5' : '#fef2f2',
                            color: dish.type === 'VEG' ? '#059669' : '#dc2626',
                            border: `1px solid ${dish.type === 'VEG' ? '#a7f3d0' : '#fecaca'}`,
                          }}
                        >
                          ● {dish.type}
                        </span>
                        <span style={{ fontSize: '11px', color: '#71717a', fontWeight: '600' }}>
                          ₹{dish.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper */}
                  <div className="cart-stepper-pill">
                    <button
                      type="button"
                      className="cart-stepper-btn cart-stepper-minus"
                      onClick={() => decrement(dish.id)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="cart-stepper-count">{formatQty(qty)}</span>
                    <button
                      type="button"
                      className="cart-stepper-btn cart-stepper-plus"
                      onClick={() => increment(dish.id)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
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
