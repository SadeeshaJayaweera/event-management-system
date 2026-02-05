'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-new">
      <div className="footer-container">
        {/* Footer Content */}
        <div className="footer-content">
          {/* Brand Column */}
          <div className="footer-column">
            <div className="footer-brand">
              <span className="footer-brand-text">EventFlow</span>
            </div>
            <p className="footer-description">
              Making events accessible, one booking at a time.
            </p>
          </div>

          {/* Product Column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Product</h4>
            <ul className="footer-links">
              <li><Link href="/events">Browse Events</Link></li>
              <li><Link href="/events/create">Create Event</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Company</h4>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Resources</h4>
            <ul className="footer-links">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/docs">Documentation</Link></li>
              <li><Link href="/api">API</Link></li>
              <li><Link href="/status">Status</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} EventFlow. All rights reserved.
          </p>
          <div className="footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <span className="separator">•</span>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
