import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Home, History, LogOut, Sparkles, Menu, X } from 'lucide-react';

interface NavbarProps {
  onLogout?: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => router.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    router.push('/');
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '4rem',
          position: 'relative',
        }}>
          {/* Logo */}
          <div
            onClick={() => handleNavClick('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              minWidth: 'fit-content',
              position: 'absolute',
              left: '1rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </div>
            <span style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SPAVIX
            </span>
          </div>

          {/* Desktop Navigation Links (Center) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }} className="navbar-desktop-menu">
            {/* Dashboard Button */}
            <button
              onClick={() => handleNavClick('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: isActive('/dashboard') ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: isActive('/dashboard') ? '#60a5fa' : '#cbd5e1',
                border: isActive('/dashboard') ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: isActive('/dashboard') ? '600' : '500',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard')) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = '#93c5fd';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              <Home style={{ width: '1rem', height: '1rem' }} />
              <span className="navbar-text">Dashboard</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => handleNavClick('/history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: isActive('/history') ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: isActive('/history') ? '#60a5fa' : '#cbd5e1',
                border: isActive('/history') ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: isActive('/history') ? '600' : '500',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/history')) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = '#93c5fd';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/history')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              <History style={{ width: '1rem', height: '1rem' }} />
              <span className="navbar-text">History</span>
            </button>
          </div>

          {/* Logout Button (Right) */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              position: 'absolute',
              right: '5rem',
            }}
            className="navbar-logout-btn"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <LogOut style={{ width: '1rem', height: '1rem' }} />
            <span className="navbar-text">Logout</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#cbd5e1',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'absolute',
              right: '1rem',
            }}
            className="navbar-mobile-button"
          >
            {mobileMenuOpen ? (
              <X style={{ width: '1.5rem', height: '1.5rem' }} />
            ) : (
              <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          position: 'sticky',
          top: '4rem',
          zIndex: 99,
        }}>
          <button
            onClick={() => handleNavClick('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: isActive('/dashboard') ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: isActive('/dashboard') ? '#60a5fa' : '#cbd5e1',
              border: isActive('/dashboard') ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: isActive('/dashboard') ? '600' : '500',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Home style={{ width: '1.25rem', height: '1.25rem' }} />
            Dashboard
          </button>

          <button
            onClick={() => handleNavClick('/history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: isActive('/history') ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: isActive('/history') ? '#60a5fa' : '#cbd5e1',
              border: isActive('/history') ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: isActive('/history') ? '600' : '500',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <History style={{ width: '1.25rem', height: '1.25rem' }} />
            History
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
            Logout
          </button>
        </div>
      )}

      <style>{`
        /* Desktop menu - hidden on mobile */
        .navbar-desktop-menu {
          display: none;
        }
        
        /* Logout button - hidden on mobile */
        .navbar-logout-btn {
          display: none !important;
        }
        
        /* Mobile button - hidden on desktop */
        .navbar-mobile-button {
          display: flex !important;
        }
        
        /* Text labels - hidden on mobile */
        .navbar-text {
          display: none;
        }
        
        /* Desktop breakpoint (768px and up) */
        @media (min-width: 768px) {
          .navbar-desktop-menu {
            display: flex !important;
          }
          
          .navbar-logout-btn {
            display: flex !important;
          }
          
          .navbar-mobile-button {
            display: none !important;
          }
          
          .navbar-text {
            display: inline !important;
          }
        }
      `}</style>
    </>
  );
}
