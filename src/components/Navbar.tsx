'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, Bot, CalendarDays } from 'lucide-react';

const navItems = [
  {
    href: '/menu',
    icon: UtensilsCrossed,
    label: 'Menu',
  },
  {
    href: '/ai-assistant',
    icon: Bot,
    label: 'Tanya AI',
  },
  {
    href: '/reservasi',
    icon: CalendarDays,
    label: 'Booking Meja',
  },
];

export default function Navbar() {
  const pathname = usePathname();

  // Hide bottom and top navbars on the landing page
  if (pathname === '/') return null;

  return (
    <>
      {/* ── TOP NAV BAR (Desktop only, >= 768px) ── */}
      <nav className="desktop-top-nav">
        <div className="desktop-nav-container">
          <Link href="/" className="desktop-nav-logo">
            <img src="/smart-coffee.svg" alt="KUPITA Logo" />
            <span>KUPITA</span>
          </Link>
          <div className="desktop-nav-links">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`desktop-nav-link ${isActive ? 'active' : ''}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── BOTTOM NAV BAR (Mobile only, < 768px) ── */}
      <nav className="mobile-bottom-nav">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const mobileLabel = label === 'Booking Meja' ? 'Booking' : label === 'Tanya AI' ? 'AI' : label;

          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ transition: 'all var(--transition-fast)' }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: 1,
                }}
              >
                {mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
