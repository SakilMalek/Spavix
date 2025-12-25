'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, LogOut } from 'lucide-react';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from '@/components/ui/resizable-navbar';

export default function AceterityNavbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'History', link: '/history' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <Navbar>
      <NavBody>
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src={isDark ? '/logo-dark.png' : '/logo-light.png'}
            alt="SPAVIX"
            className="h-12 w-auto"
          />
          <span className={isDark ? 'text-white text-lg font-bold' : 'text-gray-900 text-lg font-bold'}>
            SPAVIX
          </span>
        </div>

        {/* Nav Items */}
        <NavItems items={navItems} />

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                : 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isDark
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
            }`}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <div className="flex items-center gap-2">
            <img
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="SPAVIX"
              className="h-10 w-auto"
            />
            <span className={isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'}>
              SPAVIX
            </span>
          </div>
          <MobileNavToggle
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
          {navItems.map((item) => (
            <a
              key={item.link}
              href={item.link}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                isDark
                  ? 'text-neutral-300 hover:bg-neutral-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </a>
          ))}
          <button
            onClick={handleThemeToggle}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isDark
                ? 'text-yellow-400 hover:bg-neutral-800'
                : 'text-blue-600 hover:bg-gray-100'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isDark
                ? 'text-red-300 hover:bg-neutral-800'
                : 'text-red-600 hover:bg-gray-100'
            }`}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
