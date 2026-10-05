'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function ServiceCartBottomSheet() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    specialInstructions,
    setSpecialInstructions,
    submitCartRequest,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    submitCartRequest();
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const formatQty = (qty) => {
    if (qty < 10) return `0${qty}`;
    return `${qty}`;
  };

  return (
    <div className="cart-backdrop" onClick={closeCart}>
      <div
        className="cart-sheet-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Pull handle indicator */}
        <div className="cart-drag-handle" />

        {/* Header */}
        <div className="cart-header-row">
          <div>
            <h2 id="cart-title" className="cart-title">Service Cart</h2>
            <p className="cart-subtitle">Review your selected services and submit the request</p>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart items list */}
        <div className="cart-items-scroll">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🛒</div>
              <p className="cart-empty-text">Your service cart is empty</p>
              <span className="cart-empty-sub">Add dining, housekeeping, or room services to request them here.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                {/* Remove button */}
                <button
                  type="button"
                  className="cart-item-remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item"
                  aria-label={`Remove ${item.name}`}
                >
                  ✕
                </button>

                {/* Thumbnail */}
                <div className="cart-item-img-wrap">
                  <img
                    src={item.image || '/images/service_img_food.png'}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/service_img_food.png';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-category">{item.category}</div>
                </div>

                {/* Stepper */}
                <div className="cart-stepper-pill">
                  <button
                    type="button"
                    className="cart-stepper-btn cart-stepper-minus"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="cart-stepper-count">{formatQty(item.quantity)}</span>
                  <button
                    type="button"
                    className="cart-stepper-btn cart-stepper-plus"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Price */}
                <div className="cart-item-price">
                  {item.price > 0 ? `₹${item.price * item.quantity}` : 'Free'}
                </div>
              </div>
            ))
          )}

          {/* Special Instructions card */}
          {cartItems.length > 0 && (
            <div className="cart-instructions-card">
              <div className="cart-instructions-header">
                <div className="cart-instructions-icon-badge">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <span className="cart-instructions-title">Special Instructions (Optional)</span>
              </div>
              <textarea
                className="cart-instructions-input"
                rows="2"
                placeholder="Add any special request here..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Sticky footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer-bar">
            <div className="cart-footer-total">
              <span className="cart-total-label">Total Amount</span>
              <span className="cart-total-amount">₹{cartTotal}</span>
            </div>

            <button
              type="button"
              className="cart-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                pointerEvents: isSubmitting ? 'none' : 'auto'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
