import './guest.css';
import { AppProvider } from '@/context/AppContext';
import GuestAppShell from '@/components/layout/GuestAppShell';

export const metadata = {
  title: 'Jayaasi Rooms — Business Suite Guest Application',
  description: 'Luxury hotel guest application for Jayaasi Rooms Business Suite.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7a0c24',
};

export default function GuestLayout({ children }) {
  return (
    <AppProvider>
      <GuestAppShell>
        {children}
      </GuestAppShell>
    </AppProvider>
  );
}
