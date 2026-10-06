/**
 * Layout for /h/[hotelCode]/r/[roomCode] QR landing pages.
 * Standalone layout — does NOT inherit the guest app shell.
 * No nav bar, no cart, just the session gate UI.
 */

import '../../qr-landing.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
};

export default function QrHotelLayout({ children }) {
  return children;
}
