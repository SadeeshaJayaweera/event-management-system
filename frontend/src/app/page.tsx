'use client';

/* eslint-disable react/no-unescaped-entities */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Event } from '../types';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const upcoming = await eventService.getUpcomingEvents();
        setUpcomingEvents(upcoming.slice(0, 3)); // Show only 3 featured events
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <main className="homepage-exact">
      {/* Hero Section */}
      <section className="hero-section-exact">
        <div className="hero-content-exact">
          <h1 className="hero-title-exact">
            Event Management
            <br />
            <span className="hero-highlight-exact">Reimagined</span>
          </h1>
          <p className="hero-subtitle-exact">
            The all-in-one platform for organizers to host sourcing events and for attendees to discover unforgettable experiences.
          </p>
          <div className="hero-actions-exact">
            <Link href={isAuthenticated ? '/events/create' : '/auth/register'} className="btn-start-free">
              Get Started Free
            </Link>
            <button className="btn-watch-demo">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="upcoming-events-section-exact">
        <div className="section-header-exact">
          <div>
            <h2 className="section-title-exact">Upcoming Events</h2>
            <p className="section-subtitle-exact">Discover what's trending this month</p>
          </div>
          <Link href="/events" className="view-all-link-exact">
            View all events →
          </Link>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex-center" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="events-grid-exact">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
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

      {/* Features Section */}
      <section className="features-section-exact">
        <div className="features-header-exact">
          <h2 className="section-title-exact">Everything you need to succeed</h2>
          <p className="section-subtitle-exact">Powerful tools to organize, host, and experience live attendances.</p>
        </div>

        <div className="features-grid-exact">
          <div className="feature-card-exact">
            <div className="feature-icon-exact">📅</div>
            <h3 className="feature-title-exact">Smart Scheduling</h3>
            <p className="feature-desc-exact">
              Effortlessly manage timelines, venues, and speakers with our intuitive drag-and-drop interface.
            </p>
          </div>

          <div className="feature-card-exact">
            <div className="feature-icon-exact">👥</div>
            <h3 className="feature-title-exact">Attendance Management</h3>
            <p className="feature-desc-exact">
              Track registrations, check-ins, and engagement with real-time analytics.
            </p>
          </div>

          <div className="feature-card-exact">
            <div className="feature-icon-exact">🔒</div>
            <h3 className="feature-title-exact">Secure Payments</h3>
            <p className="feature-desc-exact">
              Process ticket sales securely with automated invoicing and instant payouts to your account.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section-exact">
        <div className="social-proof-container-exact">
          <div className="social-proof-left-exact">
            <h2 className="section-title-exact">Trusted by thousands of event planners</h2>
            
            <div className="trust-points-exact">
              <div className="trust-point-exact">
                <span className="trust-icon-exact">✓</span>
                <p>All-in-one platform handling everything from ticketing to feedback</p>
              </div>
              <div className="trust-point-exact">
                <span className="trust-icon-exact">✓</span>
                <p>Highly-rated by event organizers and attendees</p>
              </div>
              <div className="trust-point-exact">
                <span className="trust-icon-exact">✓</span>
                <p>24/7 customer support for peace of mind</p>
              </div>
              <div className="trust-point-exact">
                <span className="trust-icon-exact">✓</span>
                <p>Customizable branding to match your organization's identity</p>
              </div>
            </div>
          </div>

          <div className="social-proof-right-exact">
            <div className="testimonial-card-exact">
              <div className="testimonial-image-exact">
                <Image 
                  src="/testimonial-event.svg" 
                  alt="Event attendees" 
                  width={400} 
                  height={300}
                  className="testimonial-img"
                />
              </div>
              <div className="testimonial-rating-exact">
                <span className="star-exact">⭐</span>
                <span className="star-exact">⭐</span>
                <span className="star-exact">⭐</span>
                <span className="star-exact">⭐</span>
                <span className="star-exact">⭐</span>
              </div>
              <p className="testimonial-text-exact">
                &quot;EventFlow has transformed how we organize our annual conference. The platform is intuitive, reliable, and has significantly improved our attendee experience. Highly recommended!&quot;
              </p>
              <div className="testimonial-author-exact">
                <div className="author-name-exact">Sarah J.</div>
                <div className="author-title-exact">Event Director</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="final-cta-section-exact">
          <h2>Ready to create your first event?</h2>
          <p>Join thousands of event organizers using EventFlow</p>
          <Link href="/auth/register" className="btn-cta-exact">
            Get Started Free
          </Link>
        </section>
      )}
    </main>
  );
}
