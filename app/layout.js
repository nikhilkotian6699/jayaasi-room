import './globals.css';

export const metadata = {
  title: 'Jayaasi Rooms',
  description: 'Hotel Management & Guest Experience Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <div id="toast-root"></div>
      </body>
    </html>
  );
}
