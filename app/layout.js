import './globals.css';

export const metadata = {
  title: 'Jayaasi Room — Hotel Operations Platform',
  description: 'Complete hotel operations platform with guest services, staff dashboard, and admin management.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f6f7f5" />
      </head>
      <body>
        {children}
        <div id="toast-root"></div>
      </body>
    </html>
  );
}
