'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Event } from '../types';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const upcoming = await eventService.getUpcomingEvents();
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = [
    { name: 'All Events', value: '' },
    { name: 'Music', value: 'CONCERT' },
    { name: 'Tech', value: 'TECHNOLOGY' },
    { name: 'Sports', value: 'SPORTS' },
    { name: 'Art', value: 'ARTS' },
    { name: 'Food', value: 'FOOD' },
  ];

  return (
    <main className="home-container">
      {/* Hero Section for Authenticated Users */}
      {isAuthenticated ? (
        <section className="authenticated-hero">
          <div className="hero-banner">
            <div className="banner-badge">
              <span className="badge-icon">🎯</span>
              <span className="badge-text">Discover Amazing Events</span>
            </div>
            <h1 className="banner-title">
              Find Your Next <span className="highlight">Perfect Event</span>
            </h1>
            <p className="banner-subtitle">
              Explore thousands of amazing events happening around you. From
              music festivals to tech conferences, find and join events that match
              your interests.
            </p>
            <div className="banner-actions">
              <Link href="/events" className="btn btn-primary">
                Explore Events
              </Link>
              <Link href="/events/create" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>

          <div className="hero-cards">
            <div className="hero-card">
              <div className="hero-card-icon">⚡</div>
              <h3 className="hero-card-title">Live Events</h3>
              <p className="hero-card-desc">1000+ happening now</p>
            </div>
            <div className="hero-card">
              <div className="hero-card-icon">✨</div>
              <h3 className="hero-card-title">Trending</h3>
              <p className="hero-card-desc">Popular this week</p>
            </div>
            <div className="hero-card">
              <div className="hero-card-icon">🎪</div>
              <h3 className="hero-card-title">Quick Join</h3>
              <p className="hero-card-desc">Get instant access to events near you</p>
            </div>
          </div>
        </section>
      ) : (
        /* Hero Section for Non-Authenticated Users */
        <section className="hero-section">
          <h1>Discover Amazing Events ✨</h1>
          <p>Find and book tickets for the best events in your area</p>
          <div className="btn-group">
            <Link href="/events" className="btn btn-primary">
              <span>🎫</span> Browse Events
            </Link>
            <Link href="/auth/register" className="btn btn-secondary">
              <span>🚀</span> Get Started
            </Link>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      <section className="events-section">
        <div className="section-header">
          <h2 className="section-title">Upcoming Events</h2>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex-center" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <>
            <div className="events-grid">
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            {upcomingEvents.length > 6 && (
              <div className="load-more-container">
                <Link href="/events" className="btn-load-more">
                  Load More Events →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center">
            <h3>📅 No upcoming events found</h3>
            <p className="mt-md mb-lg">Be the first to create an amazing event!</p>
            <Link href="/events/create" className="btn btn-primary">
              Create the first event →
            </Link>
          </div>
        )}
      </section>

      {/* Bottom CTA Cards */}
      {isAuthenticated && (
        <section className="cta-section">
          <div className="cta-cards">
            <div className="cta-card">
              <h3 className="cta-title">Create Event</h3>
              <p className="cta-desc">
                Host your own event and reach thousands of interested attendees
              </p>
              <Link href="/events/create" className="cta-btn">
                Get Started
              </Link>
            </div>
            <div className="cta-card">
              <h3 className="cta-title">Discover</h3>
              <p className="cta-desc">
                Browse through our curated selection of events in your area
              </p>
              <Link href="/events" className="cta-btn">
                Browse Events
              </Link>
            </div>
            <div className="cta-card">
              <h3 className="cta-title">Network</h3>
              <p className="cta-desc">
                Connect with like-minded people at amazing events
              </p>
              <Link href="/events" className="cta-btn">
                Join Community
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
