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
    label: 'AI',
  },
  {
    href: '/reservasi',
    icon: CalendarDays,
    label: 'Booking',
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: 'white',
        borderTop: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-navbar)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          height: 64,
          alignItems: 'stretch',
        }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                textDecoration: 'none',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                transition: 'color 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Active indicator top bar */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '25%',
                    right: '25%',
                    height: 2,
                    background: 'var(--color-primary)',
                    borderRadius: '0 0 4px 4px',
                  }}
                />
              )}

              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ transition: 'all 0.15s ease' }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
