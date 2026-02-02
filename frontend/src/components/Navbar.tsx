'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/events?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Side: Brand/Logo */}
        <Link href="/" className="navbar-brand">
          <div className="brand-logo">
            <span className="brand-emoji">🎫</span>
          </div>
          <span className="brand-text">EventHub</span>
        </Link>

        {/* Center: Search Bar (only show when authenticated) */}
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="navbar-search">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              🔍
            </button>
          </form>
        )}

        {/* Right Side: Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <button className="navbar-icon-btn" aria-label="Notifications">
                <span className="icon-bell">🔔</span>
                <span className="notification-badge">3</span>
              </button>

              {/* New Event Button */}
              <Link href="/events/create" className="navbar-new-event-btn">
                <span className="btn-icon">➕</span>
                <span className="btn-text">New Event</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="navbar-signin-btn">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
