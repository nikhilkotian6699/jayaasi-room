'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MobileHeader from '@/components/layout/MobileHeader';

export default function CabService() {
  const { addToCart, openCart, showToast, cartItemCount } = useApp();

  const [pickupLocation] = useState('Jayaasi Rooms — Main Porch');
  const [dropLocation, setDropLocation] = useState('Pune International Airport');
  const [pickupTime, setPickupTime] = useState('Now (5-10 mins)');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [provider, setProvider] = useState('Hotel Chauffeur');

  const popularDestinations = [
    'Pune International Airport',
    'Pune Junction Railway Station',
    'Phoenix Marketcity, Viman Nagar',
    'Aga Khan Palace',
    'Koregaon Park Dining Street',
    'Shaniwar Wada',
  ];

  const vehicleOptions = [
    { type: 'Sedan', name: 'Executive Sedan', price: 450, capacity: '4 Seats', icon: '🚗' },
    { type: 'SUV', name: 'Premium SUV', price: 750, capacity: '6 Seats', icon: '🚙' },
    { type: 'Chauffeur', name: 'Luxury Chauffeur', price: 1200, capacity: 'Mercedes E-Class', icon: '✨' },
  ];

  const handleBookCab = () => {
    if (!dropLocation.trim()) {
      showToast('Please enter or select a drop destination');
      return;
    }

    const selectedVehicle = vehicleOptions.find((v) => v.type === vehicleType) || vehicleOptions[0];

    addToCart({
      id: `cab-${Date.now()}`,
      name: `Cab to ${dropLocation} (${selectedVehicle.name})`,
      category: 'Cab Services',
      price: selectedVehicle.price,
      quantity: 1,
      image: '/images/service_img_cabs.png',
    });

    openCart();
  };

  return (
    <>
      <MobileHeader hotelName="Hotel name" pageTitle="Cab services" showBack backHref="/services" />

      <main className="cab-page-body">
        {/* Banner Card */}
        <div className="cab-header-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#e5b869', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Business Suite Mobility
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 2px' }}>
                Private Cab & Airport Transfers
              </h1>
              <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: 0 }}>
                Door-to-door concierge chauffeured rides
              </p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#33272b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              🚕
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="cab-booking-form">
          {/* Pickup */}
          <div className="cab-field-group">
            <label className="cab-field-label">Pickup Location</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="cab-field-input"
                value={pickupLocation}
                readOnly
                style={{ background: '#f8fafc', color: '#475569' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: '700', color: '#870f2b' }}>
                HOTEL
              </span>
            </div>
          </div>

          {/* Drop */}
          <div className="cab-field-group">
            <label className="cab-field-label">Drop Destination</label>
            <input
              type="text"
              className="cab-field-input"
              placeholder="Enter destination address or landmark"
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
            />

            {/* Quick destination chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {popularDestinations.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setDropLocation(dest)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '999px',
                    border: dropLocation === dest ? '1.5px solid #870f2b' : '1px solid #e2e8f0',
                    background: dropLocation === dest ? '#fdf2f4' : '#ffffff',
                    color: dropLocation === dest ? '#870f2b' : '#64748b',
                    fontSize: '10.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="cab-field-group">
            <label className="cab-field-label">Select Vehicle Category</label>
            <div className="cab-type-grid">
              {vehicleOptions.map((v) => (
                <div
                  key={v.type}
                  className={`cab-type-btn ${vehicleType === v.type ? 'active' : ''}`}
                  onClick={() => setVehicleType(v.type)}
                >
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>{v.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#18181b' }}>{v.type}</div>
                  <div style={{ fontSize: '10px', color: '#71717a' }}>{v.capacity}</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#870f2b', marginTop: '4px' }}>
                    ₹{v.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="cab-field-group">
            <label className="cab-field-label">Departure Time</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Now (5-10 mins)', 'In 30 mins', 'Schedule Later'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setPickupTime(time)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: pickupTime === time ? '1.5px solid #870f2b' : '1px solid #e2e8f0',
                    background: pickupTime === time ? '#fdf2f4' : '#ffffff',
                    color: pickupTime === time ? '#870f2b' : '#64748b',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Provider */}
          <div className="cab-field-group" style={{ marginBottom: 0 }}>
            <label className="cab-field-label">Chauffeur Service Provider</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Hotel Chauffeur', 'Uber Black', 'Ola Prime'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: '10px',
                    border: provider === p ? '1.5px solid #870f2b' : '1px solid #e2e8f0',
                    background: provider === p ? '#fdf2f4' : '#ffffff',
                    color: provider === p ? '#870f2b' : '#64748b',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="button" className="cab-submit-btn" onClick={handleBookCab}>
            Request Cab Transfer
          </button>
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
