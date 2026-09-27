import './guest.css';

export const metadata = {
  title: 'Jayaasi Room — Guest Experience',
  description: 'Your hotel room at your fingertips. Order food, request services, explore nearby places.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function GuestLayout({ children }) {
  return (
    <div className="guest-shell">
      {children}
    </div>
  );
}
