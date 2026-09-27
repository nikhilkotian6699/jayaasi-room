'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';

export default function GuestTravelPage() {
  const baseUrl = '/jayaasi-rooms/204';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('offices');
  const [favourites, setFavourites] = useState(['mangalore-sez', 'infosys']);
  const [selectedLocationForCab, setSelectedLocationForCab] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState('sedan');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [specialNote, setSpecialNote] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavourites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? 'Removed from Favourites' : 'Added to Favourites ⭐');
      return next;
    });
  };

  // ─── Location Data matching Design Exactly ────────────────────────────
  const allLocations = [
    {
      id: 'mangalore-sez',
      name: 'Mangalore SEZ',
      distance: '2.1 km',
      address: 'Special Economic Zone, Mangaluru',
      image: '/images/travel_card_mangalore_sez.png',
      category: 'offices',
      sedanPrice: '₹220',
      suvPrice: '₹380',
      luxuryPrice: '₹690',
      estTime: '3 mins away',
    },
    {
      id: 'infosys',
      name: 'Infosys Mangalore',
      distance: '3.4 km',
      address: 'KIADB, Mangaluru',
      image: '/images/travel_card_infosys.png',
      category: 'offices',
      sedanPrice: '₹280',
      suvPrice: '₹440',
      luxuryPrice: '₹790',
      estTime: '4 mins away',
    },
    {
      id: 'mphasis',
      name: 'Mphasis Limited',
      distance: '4.2 km',
      address: 'Kankanady, Mangaluru',
      image: '/images/travel_card_mphasis.png',
      category: 'offices',
      sedanPrice: '₹320',
      suvPrice: '₹480',
      luxuryPrice: '₹850',
      estTime: '5 mins away',
    },
    {
      id: 'city-centre',
      name: 'City Centre Mall (Business)',
      distance: '5.1 km',
      address: 'Hampankatta, Mangaluru',
      image: '/images/travel_card_city_centre.png',
      category: 'offices',
      sedanPrice: '₹360',
      suvPrice: '₹520',
      luxuryPrice: '₹890',
      estTime: '4 mins away',
    },
    {
      id: 'nitk',
      name: 'NITK Surathkal',
      distance: '7.8 km',
      address: 'Surathkal, Mangaluru',
      image: '/images/travel_card_nitk.png',
      category: 'offices',
      sedanPrice: '₹490',
      suvPrice: '₹720',
      luxuryPrice: '₹1,190',
      estTime: '6 mins away',
    },
    // Business Hubs category additions
    {
      id: 'lilly-tech',
      name: 'Lilly Tech & Innovation Hub',
      distance: '4.8 km',
      address: 'Maryhill IT Corridor, Mangaluru',
      image: '/images/travel_card_mphasis.png',
      category: 'hubs',
      sedanPrice: '₹340',
      suvPrice: '₹510',
      luxuryPrice: '₹870',
      estTime: '5 mins away',
    },
    {
      id: 'kavoor-park',
      name: 'Kavoor Software Technology Park',
      distance: '6.4 km',
      address: 'Airport Highway Road, Mangaluru',
      image: '/images/travel_card_mangalore_sez.png',
      category: 'hubs',
      sedanPrice: '₹410',
      suvPrice: '₹620',
      luxuryPrice: '₹980',
      estTime: '6 mins away',
    },
    // Popular Places category additions
    {
      id: 'panambur-beach',
      name: 'Panambur Port & Beach',
      distance: '8.2 km',
      address: 'Near NMPT, NH-66, Mangaluru',
      image: '/images/travel_card_city_centre.png',
      category: 'popular',
      sedanPrice: '₹520',
      suvPrice: '₹760',
      luxuryPrice: '₹1,250',
      estTime: '7 mins away',
    },
    {
      id: 'kadri-temple',
      name: 'Kadri Hills & Heritage Park',
      distance: '3.9 km',
      address: 'Kadri Road, Mangaluru',
      image: '/images/travel_card_infosys.png',
      category: 'popular',
      sedanPrice: '₹290',
      suvPrice: '₹450',
      luxuryPrice: '₹780',
      estTime: '3 mins away',
    },
  ];

  // ─── Filtered Locations ───────────────────────────────────────────────
  const filteredLocations = useMemo(() => {
    return allLocations.filter((item) => {
      // Category filter
      if (selectedCategory === 'favourites') {
        if (!favourites.includes(item.id)) return false;
      } else if (selectedCategory === 'offices') {
        if (item.category !== 'offices') return false;
      } else if (selectedCategory === 'hubs') {
        if (item.category !== 'hubs' && item.category !== 'offices') return false;
      } else if (selectedCategory === 'popular') {
        if (item.category !== 'popular') return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAddr = item.address.toLowerCase().includes(q);
        return matchesName || matchesAddr;
      }

      return true;
    });
  }, [allLocations, selectedCategory, favourites, searchQuery]);

  const handleBookCabClick = (location) => {
    setSelectedLocationForCab(location);
    setSelectedVehicleType('sedan');
    setBookingConfirmed(false);
    setSpecialNote('');
  };

  const handleConfirmBooking = () => {
    setBookingConfirmed(true);
    showToast(`Cab confirmed to ${selectedLocationForCab.name}! Driver arriving soon.`);
  };

  return (
    <div className="guest-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#18191b',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: '999px',
            zIndex: 9999,
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shared Luxury Header with Title: 'Cab serviecs' */}
      <GuestHeader hotelName="Hotel name" pageTitle="Cab serviecs" />

      {/* Main Body */}
      <main className="guest-main-body">
        <div className="travel-page-container" style={{ paddingBottom: '36px' }}>
          {/* ─── Hero Banner matching PDF Artboard ───────────────────────── */}
          <div className="travel-hero-card">
            <img
              src="/images/travel_hero_banner.png"
              alt="Business Travel - Nearby Offices & Business Locations"
              className="travel-hero-img"
            />
          </div>

          {/* ─── Search & Filter Bar ────────────────────────────────────── */}
          <div className="travel-search-container">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              placeholder="Search office, company or business location..."
              className="travel-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px',
                }}
              >
                ✕
              </button>
            )}

            <button
              type="button"
              className="travel-filter-toggle"
              title="Filter by distance or rating"
              onClick={() => showToast('Filtered by distance from Hotel Lobby')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1f2937"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
            </button>
          </div>

          {/* ─── Category Filter Chips ──────────────────────────────────── */}
          <div className="travel-tabs-row">
            {/* Tab 1: Nearby Offices */}
            <button
              type="button"
              className={`travel-tab-btn ${selectedCategory === 'offices' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('offices')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="9" y1="6" x2="9.01" y2="6" />
                <line x1="15" y1="6" x2="15.01" y2="6" />
                <line x1="9" y1="10" x2="9.01" y2="10" />
                <line x1="15" y1="10" x2="15.01" y2="10" />
                <line x1="9" y1="14" x2="9.01" y2="14" />
                <line x1="15" y1="14" x2="15.01" y2="14" />
                <path d="M10 22v-4h4v4" />
              </svg>
              <span>Nearby Offices</span>
            </button>

            {/* Tab 2: Business Hubs */}
            <button
              type="button"
              className={`travel-tab-btn ${selectedCategory === 'hubs' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('hubs')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span>Business Hubs</span>
            </button>

            {/* Tab 3: Popular Places */}
            <button
              type="button"
              className={`travel-tab-btn ${selectedCategory === 'popular' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('popular')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Popular Places</span>
            </button>

            {/* Tab 4: Favourites */}
            <button
              type="button"
              className={`travel-tab-btn ${selectedCategory === 'favourites' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('favourites')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Favourites ({favourites.length})</span>
            </button>
          </div>

          {/* ─── Location Cards List ────────────────────────────────────── */}
          <div className="travel-cards-list">
            {filteredLocations.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  border: '1px solid #edf0f3',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>No locations found</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  Try a different search keyword or category tab
                </div>
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isFav = favourites.includes(loc.id);
                return (
                  <div key={loc.id} className="travel-location-card">
                    <div className="travel-card-left">
                      <img
                        src={loc.image}
                        alt={loc.name}
                        className="travel-card-thumb"
                        onError={(e) => {
                          e.target.src = '/images/cabs.jpg';
                        }}
                      />
                      <div className="travel-card-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="travel-card-title">{loc.name}</span>
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(e, loc.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '1px 2px',
                              fontSize: '11px',
                              color: isFav ? '#eab308' : '#cbd5e1',
                              lineHeight: 1,
                            }}
                            title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                          >
                            ★
                          </button>
                        </div>

                        <div className="travel-card-distance-row">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#dc2626">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <span>{loc.distance}</span>
                        </div>

                        <div className="travel-card-address">{loc.address}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="travel-cab-action-btn"
                      onClick={() => handleBookCabClick(loc)}
                      title={`Book cab to ${loc.name}`}
                    >
                      {/* Car Icon */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                      </svg>
                      <span>Click for Cab</span>
                      <span style={{ fontSize: '12px', marginLeft: '-2px' }}>›</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ─── Interactive Cab Booking Modal ─────────────────────────────── */}
      {selectedLocationForCab && (
        <div className="guest-modal-backdrop" onClick={() => setSelectedLocationForCab(null)}>
          <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="guest-modal-header">
              <div>
                <span className="guest-modal-title">Book Hotel Cab</span>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  Doorstep pickup at Hotel Lobby • Room 204
                </div>
              </div>
              <button
                type="button"
                className="guest-modal-close"
                onClick={() => setSelectedLocationForCab(null)}
              >
                ✕
              </button>
            </div>

            {!bookingConfirmed ? (
              <>
                {/* Destination Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fdf2f4 0%, #fae8eb 100%)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    border: '1px solid #f3cbd3',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={selectedLocationForCab.image}
                      alt={selectedLocationForCab.name}
                      style={{ width: '44px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#880f2b' }}>
                        {selectedLocationForCab.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {selectedLocationForCab.address}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#880f2b',
                      background: 'rgba(255,255,255,0.8)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {selectedLocationForCab.distance}
                  </span>
                </div>

                {/* Ride Option Selection */}
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                  Choose Ride Class
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {/* Option 1: Sedan */}
                  <div
                    onClick={() => setSelectedVehicleType('sedan')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border:
                        selectedVehicleType === 'sedan'
                          ? '1.5px solid #840d29'
                          : '1px solid #e5e7eb',
                      background: selectedVehicleType === 'sedan' ? '#fdf4f6' : '#fafafa',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🚗</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#111827' }}>
                          Executive Sedan (AC)
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                          Dzire / Etios • 4 seats • {selectedLocationForCab.estTime}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#840d29' }}>
                        {selectedLocationForCab.sedanPrice}
                      </div>
                      <div style={{ fontSize: '9px', color: '#15803d', fontWeight: '600' }}>Instant Pickup</div>
                    </div>
                  </div>

                  {/* Option 2: SUV */}
                  <div
                    onClick={() => setSelectedVehicleType('suv')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border:
                        selectedVehicleType === 'suv'
                          ? '1.5px solid #840d29'
                          : '1px solid #e5e7eb',
                      background: selectedVehicleType === 'suv' ? '#fdf4f6' : '#fafafa',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🚙</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#111827' }}>
                          Premier SUV (Innova Crysta)
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                          Spacious • 6 seats • 5 mins away
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#840d29' }}>
                        {selectedLocationForCab.suvPrice}
                      </div>
                      <div style={{ fontSize: '9px', color: '#6b7280' }}>Extra Luggage</div>
                    </div>
                  </div>

                  {/* Option 3: Luxury Chauffeur */}
                  <div
                    onClick={() => setSelectedVehicleType('luxury')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border:
                        selectedVehicleType === 'luxury'
                          ? '1.5px solid #840d29'
                          : '1px solid #e5e7eb',
                      background: selectedVehicleType === 'luxury' ? '#fdf4f6' : '#fafafa',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🚘</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#111827' }}>
                          Luxury Chauffeur (Mercedes / BMW)
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                          Uniformed chauffeur • Bottled water & Wi-Fi
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#840d29' }}>
                        {selectedLocationForCab.luxuryPrice}
                      </div>
                      <div style={{ fontSize: '9px', color: '#d97706', fontWeight: '700' }}>VIP Suite</div>
                    </div>
                  </div>
                </div>

                {/* Special Instructions Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '4px' }}>
                    Special Request (Optional):
                  </label>
                  <input
                    type="text"
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    placeholder="e.g. Please bring luggage cart to lobby / GST bill"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      fontSize: '11.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Payment notice */}
                <div
                  style={{
                    fontSize: '10.5px',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '14px',
                    background: '#f9fafb',
                    padding: '8px 10px',
                    borderRadius: '8px',
                  }}
                >
                  <span>ℹ️</span>
                  <span>Fare will be charged directly to your Hotel Room 204 bill at checkout.</span>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: 'linear-gradient(135deg, #c5163a 0%, #870f2b 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(135, 15, 43, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>Confirm Cab Booking</span>
                  <span>→</span>
                </button>
              </>
            ) : (
              /* Booking Confirmed State */
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    border: '2px solid #a7f3d0',
                  }}
                >
                  ✓
                </div>

                <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>
                  Cab Confirmed!
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
                  Your chauffeur is en route to the Hotel Front Lobby.
                </div>

                <div
                  style={{
                    background: '#f9fafb',
                    borderRadius: '14px',
                    padding: '14px',
                    border: '1px solid #e5e7eb',
                    margin: '16px 0',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Vehicle Assigned</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#111827' }}>
                      KA 19 MD 4022 (Silver)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Chauffeur</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#111827' }}>
                      Ramesh Hegde (4.9 ★)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Destination</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#880f2b' }}>
                      {selectedLocationForCab.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Estimated Arrival</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669' }}>
                      3 minutes at Hotel Porch
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLocationForCab(null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#840d29',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Luxury Footer with Travel Active */}
      <GuestFooter activeTab="travel" />
    </div>
  );
}
