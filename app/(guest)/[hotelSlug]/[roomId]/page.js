'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuestHeader from '@/components/guest/GuestHeader';
import GuestFooter from '@/components/guest/GuestFooter';

export default function GuestHome() {
  const baseUrl = '/jayaasi-rooms/204';

  // 4 Carousel Slides matching PDF/Figma canvas
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      id: 'services',
      title: 'services',
      image: '/images/hotel_suite.jpg',
      cta: 'Click here',
      href: `${baseUrl}/services`,
    },
    {
      id: 'cabs',
      title: 'Cab services',
      image: '/images/hotel_suite.jpg',
      cta: 'Click here',
      href: `${baseUrl}/travel`,
    },
    {
      id: 'food',
      title: 'Food sevices',
      image: '/images/hotel_suite.jpg',
      cta: 'Click here',
      href: `${baseUrl}/food`,
    },
    {
      id: 'room-info',
      title: 'room information',
      image: '/images/hotel_suite.jpg',
      cta: 'Click here',
      href: `${baseUrl}/room-info`,
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="guest-shell">
      {/* Shared Luxury Header */}
      <GuestHeader hotelName="Hotel name" />

      {/* Main Content Body */}
      <main className="guest-main-body">
        {/* Interactive Hero Carousel */}
        <div className="guest-hero-carousel">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`guest-hero-slide ${idx === currentSlide ? 'active' : ''}`}
            >
              <img
                src={s.image}
                alt={s.title}
                className="guest-hero-img"
              />
              <div className="guest-hero-overlay" />
              <div className="guest-hero-tag">{s.title}</div>
              <Link href={s.href} className="guest-hero-cta-btn">
                {s.cta}
              </Link>
            </div>
          ))}

          {/* Previous Arrow */}
          <button
            className="guest-carousel-nav-btn guest-carousel-prev"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            ‹
          </button>

          {/* Next Arrow */}
          <button
            className="guest-carousel-nav-btn guest-carousel-next"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div className="guest-carousel-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`guest-carousel-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ─── 2x2 Services Grid ───────────────────────────────────────── */}
        <div className="guest-mosaic-grid">
          {/* Card 1: Cab Services */}
          <Link href={`${baseUrl}/travel`} className="guest-mosaic-card">
            <img src="/images/cabs.jpg" alt="Cab services" className="guest-mosaic-image" />
            <div className="guest-mosaic-overlay" />
            <span className="guest-mosaic-badge">Cab services</span>
            <span className="guest-mosaic-arrow">›</span>
          </Link>

          {/* Card 2: Room Information */}
          <Link href={`${baseUrl}/room-info`} className="guest-mosaic-card">
            <img src="/images/room_info.jpg" alt="Room information" className="guest-mosaic-image" />
            <div className="guest-mosaic-overlay" />
            <span className="guest-mosaic-badge">Room information</span>
            <span className="guest-mosaic-arrow">›</span>
          </Link>

          {/* Card 3: Order Food */}
          <Link href={`${baseUrl}/food`} className="guest-mosaic-card">
            <img src="/images/food.jpg" alt="order food" className="guest-mosaic-image" />
            <div className="guest-mosaic-overlay" />
            <span className="guest-mosaic-badge">order food</span>
            <span className="guest-mosaic-arrow">›</span>
          </Link>

          {/* Card 4: Room Services */}
          <Link href={`${baseUrl}/services`} className="guest-mosaic-card">
            <img src="/images/concierge.jpg" alt="Room Services" className="guest-mosaic-image" />
            <div className="guest-mosaic-overlay" />
            <span className="guest-mosaic-badge">Room Services</span>
            <span className="guest-mosaic-arrow">›</span>
          </Link>
        </div>

        {/* ─── Jayaasi Business Store Promotional Banner ───────────────────── */}
        <div 
          className="guest-store-banner"
          onClick={() => {
            const storeBtn = document.querySelector('.guest-dock-item');
            if (storeBtn) storeBtn.click();
          }}
          role="button"
          tabIndex={0}
        >
          <div className="guest-store-left">
            <span className="guest-store-title">Jayaasi Business Store</span>
            <span className="guest-store-sub">Gifts and business class products</span>
          </div>

          <div className="guest-store-media">
            <img src="/images/luxury_gift_bag.jpg" alt="Business class gifts" />
          </div>

          <button 
            className="guest-store-shop-btn"
            onClick={(e) => {
              e.stopPropagation();
              const storeBtn = document.querySelector('.guest-dock-item');
              if (storeBtn) storeBtn.click();
            }}
          >
            Shop Now &gt;
          </button>
        </div>
      </main>

      {/* Shared Luxury Footer with Home Active */}
      <GuestFooter activeTab="home" />
    </div>
  );
}
