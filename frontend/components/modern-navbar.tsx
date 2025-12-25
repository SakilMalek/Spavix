'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import { Home, History, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onLogout?: () => void;
}

export default function ModernNavbar({ onLogout }: NavbarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [toggleThemeFunc, setToggleThemeFunc] = useState<(() => void) | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const themeContext = useTheme();
      setTheme(themeContext.theme);
      setToggleThemeFunc(() => themeContext.toggleTheme);
    } catch (e) {
      // During SSR, useTheme will fail - use default light theme
      setTheme('light');
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const isActive = (path: string) => router.pathname === path;

  const handleThemeToggle = () => {
    if (toggleThemeFunc) {
      toggleThemeFunc();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    router.push('/');
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          isDark
            ? 'bg-gradient-to-b from-neutral-900 to-neutral-950/95 border-b border-neutral-700/50'
            : 'bg-gradient-to-b from-white to-gray-50/95 border-b border-gray-200/50'
        )}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Significantly Larger */}
            <div
              onClick={() => handleNavClick('/dashboard')}
              className="flex items-center gap-3 cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <img
                src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                alt="SPAVIX"
                className="h-20 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => handleNavClick('/dashboard')}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
                    isActive('/dashboard')
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'bg-blue-500/20 text-blue-700 border border-blue-400/50 shadow-lg shadow-blue-400/20'
                      : isDark
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70 border border-transparent'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 border border-transparent'
                  )}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavClick('/history')}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
                    isActive('/history')
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'bg-blue-500/20 text-blue-700 border border-blue-400/50 shadow-lg shadow-blue-400/20'
                      : isDark
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70 border border-transparent'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 border border-transparent'
                  )}
                >
                  <History size={18} />
                  <span>History</span>
                </button>
              </div>
            ) : null}

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className={cn(
                    'hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border',
                    isDark
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/40 hover:shadow-lg hover:shadow-red-500/20'
                      : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/30 hover:shadow-lg hover:shadow-red-500/10'
                  )}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => handleNavClick('/login')}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium transition-all duration-200 border',
                      isDark
                        ? 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/70 border-neutral-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 border-gray-300'
                    )}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavClick('/signup')}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium transition-all duration-200 border',
                      isDark
                        ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/40 border-blue-500/50'
                        : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-400/50'
                    )}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  'md:hidden p-2 rounded-lg transition-all border relative z-50',
                  isDark
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-neutral-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300'
                )}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className={cn(
            'md:hidden fixed top-20 left-0 right-0 z-30 border-b backdrop-blur-md',
            isDark
              ? 'bg-neutral-900/95 border-neutral-700/50'
              : 'bg-white/95 border-gray-200/50'
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick('/dashboard')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-left',
                    isActive('/dashboard')
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'bg-blue-500/20 text-blue-700 border border-blue-400/50 shadow-lg shadow-blue-400/20'
                      : isDark
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70 border border-transparent'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 border border-transparent'
                  )}
                >
                  <Home size={18} />
                  Dashboard
                </button>

                <button
                  onClick={() => handleNavClick('/history')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-left',
                    isActive('/history')
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'bg-blue-500/20 text-blue-700 border border-blue-400/50 shadow-lg shadow-blue-400/20'
                      : isDark
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70 border border-transparent'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 border border-transparent'
                  )}
                >
                  <History size={18} />
                  History
                </button>

                <button
                  onClick={handleLogout}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-left border',
                    isDark
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/40'
                      : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/30'
                  )}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('/login')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-left border',
                    isDark
                      ? 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/70 border-neutral-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 border-gray-300'
                  )}
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-left border',
                    isDark
                      ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/40 border-blue-500/50'
                      : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-400/50'
                  )}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
