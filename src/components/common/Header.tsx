import React, { useState } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  MapPin,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, navigate }) => {
  const { currentUser, memberProfile, theme, toggleTheme, selectedCityId, setSelectedCityId } = useAuth();
  const { cities } = useDatabase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);

  const selectedCity = cities.find((c) => c.id === selectedCityId);

  const navLinks = [
    { label: 'Music', route: '/music' },
    { label: 'Tour', route: '/tour' },
    { label: 'Fan Club', route: '/fan-club' },
    { label: 'About', route: '/about' },
    { label: 'Media', route: '/media' },
    { label: 'Merch', route: '/merch' },
    { label: 'News', route: '/news' },
    { label: 'Contact', route: '/contact' },
  ];

  const handleNavClick = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo / Artist Identity */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavClick('/')}
              className="text-left group flex items-center space-x-2 focus:outline-none"
            >
              <span className="font-bold tracking-tight text-lg sm:text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                ANTHONY BEASTMODE
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--border-subtle)] text-[var(--text-secondary)] font-mono">
                Official
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-4" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route || currentRoute.startsWith(`${link.route}/`);
              return (
                <button
                  key={link.route}
                  onClick={() => handleNavClick(link.route)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    isActive
                      ? 'text-[var(--accent)] bg-[var(--accent)]/10 font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* City Selector Quick Filter */}
            <div className="relative">
              <button
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Select your local city"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="max-w-[90px] truncate">
                  {selectedCity ? selectedCity.name : 'All Cities'}
                </span>
              </button>

              {citySelectorOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                    Local Tour Stop
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCityId(null);
                      setCitySelectorOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  >
                    All Cities (National)
                  </button>
                  {cities.filter((c) => c.enabled).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCityId(c.id);
                        setCitySelectorOpen(false);
                        navigate(`/tour/${c.slug}`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] flex justify-between"
                    >
                      <span>{c.name}, {c.state}</span>
                      <span className="text-[10px] text-[var(--accent)]">Tier {c.priorityTier}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme mode"
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth / Account Profile */}
            {currentUser ? (
              <button
                onClick={() => handleNavClick('/account')}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {memberProfile?.displayName || 'Member'}
                </span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleNavClick('/signin')}
                  className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Join Club
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => handleNavClick(link.route)}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              {link.label}
            </button>
          ))}
          {!currentUser && (
            <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col space-y-2">
              <button
                onClick={() => handleNavClick('/signin')}
                className="w-full text-center py-2 text-sm text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-md"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('/signup')}
                className="w-full text-center py-2 text-sm font-semibold bg-[var(--accent)] text-[#0B0C10] rounded-md"
              >
                Join Fan Club (Free)
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
