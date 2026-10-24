import type { Metadata } from 'next';
import '@/app/globals.css';

/** The admin has its own root: no public header/footer, French only, never indexed */
export const metadata: Metadata = {
  title: { template: '%s · Admin Wydad', default: 'Admin Wydad' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <body className="min-h-screen bg-surface-secondary/50 font-body text-fg antialiased">{children}</body>
    </html>
  );
}
