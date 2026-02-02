'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Calendar component data
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const days = getDaysInMonth(selectedMonth);
    const currentMonth = monthNames[selectedMonth.getMonth()];
    const currentYear = selectedMonth.getFullYear();
    const today = new Date().getDate();
    const isCurrentMonth = selectedMonth.getMonth() === new Date().getMonth() &&
        selectedMonth.getFullYear() === new Date().getFullYear();

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'My Events', href: '/my-events', icon: '📅' },
        { name: 'My Tickets', href: '/my-tickets', icon: '🎫' },
        { name: 'Saved Events', href: '/saved-events', icon: '💾' }
    ];

    const categories = [
        { name: 'Music', icon: '🎵', href: '/events?category=CONCERT' },
        { name: 'Tech', icon: '💻', href: '/events?category=TECHNOLOGY' },
        { name: 'Sports', icon: '⚽', href: '/events?category=SPORTS' },
        { name: 'Art', icon: '🎨', href: '/events?category=ARTS' },
        { name: 'Food', icon: '🍕', href: '/events?category=FOOD' }
    ];

    return (
        <aside className="sidebar">
            {/* Calendar Widget */}
            <div className="sidebar-calendar">
                <div className="calendar-header">
                    <button onClick={() => changeMonth(-1)} className="calendar-nav-btn">‹</button>
                    <h3>{currentMonth} {currentYear}</h3>
                    <button onClick={() => changeMonth(1)} className="calendar-nav-btn">›</button>
                </div>
                <div className="calendar-weekdays">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                </div>
                <div className="calendar-days">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${day === null ? 'empty' : ''} ${day === today && isCurrentMonth ? 'today' : ''
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>
                <div className="calendar-legend">
                    <div className="legend-item">
                        <div className="legend-dot event-day"></div>
                        <span>Event Day</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot today"></div>
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Dashboard Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Quick Stats */}
            <div className="sidebar-stats">
                <h4 className="stats-title">Quick Stats</h4>
                <div className="stat-item">
                    <span className="stat-label">Upcoming Events</span>
                    <span className="stat-value">12</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Saved</span>
                    <span className="stat-value">8</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Attending</span>
                    <span className="stat-value">5</span>
                </div>
            </div>

            {/* Categories */}
            <div className="sidebar-categories">
                <h4 className="categories-title">Categories</h4>
                {categories.map((category) => (
                    <Link
                        key={category.name}
                        href={category.href}
                        className="category-item"
                    >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-name">{category.name}</span>
                    </Link>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="sidebar-actions">
                <Link href="/settings" className="sidebar-action-item">
                    <span className="action-icon">⚙️</span>
                    <span className="action-text">Settings</span>
                </Link>
                <button onClick={logout} className="sidebar-action-item logout-btn">
                    <span className="action-icon">🚪</span>
                    <span className="action-text">Logout</span>
                </button>
            </div>
        </aside>
    );
}
