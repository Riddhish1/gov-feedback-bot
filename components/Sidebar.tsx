"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BrainCircuit, Building2, BookOpen, MessageSquareWarning } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  // { path: '/governance', icon: BrainCircuit, label: 'Governance Intelligence' },
  { path: '/add-office', icon: Building2, label: 'Add New Office' },
  { path: '/office-registry', icon: BookOpen, label: 'Full Office Registry' },
  { path: '/feedback', icon: MessageSquareWarning, label: 'Live AI Feed' },
];

export function Sidebar() {
  const pathname = usePathname() || '/';

  return (
    <aside
      style={{
        width: '244px',
        minWidth: '244px',
        background: '#FFFFFF',
        borderRight: '2px solid #E8EDF3',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '28px 22px 22px', borderBottom: '1px solid #F0F4F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              background: 'linear-gradient(135deg, #0B6CF5 0%, #0950c4 100%)',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(11, 108, 245, 0.28)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h8M2 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: '650',
                color: '#0F1724',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              GovIntel
            </div>
            <div style={{ fontSize: '11px', color: '#5B6472', letterSpacing: '0.01em', marginTop: '1px' }}>
              Governance Platform
            </div>
          </div>
        </div>

        {/* WhatsApp indicator */}

      </div>

      {/* Context Badge */}
      <div style={{ padding: '18px 22px 10px' }}>
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            color: '#9BA5B0',
            fontWeight: '600',
            marginBottom: '8px',
          }}
        >
          Administrative Context
        </div>
        <div
          style={{
            padding: '9px 12px',
            background: '#EAF2FF',
            borderRadius: '8px',
            fontSize: '12.5px',
            color: '#0B6CF5',
            fontWeight: '500',
            letterSpacing: '-0.1px',
            border: '1px solid #BFDBFE',
          }}
        >
          Maharashtra — State Level
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 12px', flex: 1 }}>
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            color: '#9BA5B0',
            fontWeight: '600',
            padding: '4px 12px 8px',
          }}
        >
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className=""
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                background: isActive ? '#EAF2FF' : 'transparent',
                color: isActive ? '#0B6CF5' : '#5B6472',
                transition: 'all 0.15s ease',
                border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2.1 : 1.75} />
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: isActive ? '560' : '420',
                  letterSpacing: '-0.1px',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #F0F4F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #EAF2FF 0%, #DBEAFE 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0B6CF5',
              flexShrink: 0,
            }}
          >
            SA
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '530', color: '#0F1724', letterSpacing: '-0.1px' }}>
              State Admin
            </div>
            <div style={{ fontSize: '11px', color: '#5B6472' }}>Maharashtra</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
