'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Calendar component data (only for attendees)
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
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
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

    // Navigation items based on user role
    const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

    // Organizer Navigation - Matches strict design
    const organizerNavItems = [
        {
            name: 'Dashboard', href: '/dashboard/organizer', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Events', href: '/dashboard/organizer/events', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Attendees', href: '/dashboard/organizer/attendees', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: 'Settings', href: '/dashboard/organizer/settings', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ];

    const attendeeNavItems = [
        { name: 'Dashboard', href: '/dashboard/attendee', icon: '📊' },
        { name: 'My Tickets', href: '/my-tickets', icon: '🎫' },
        { name: 'Discover', href: '/events', icon: '🔍' },
        { name: 'Saved Events', href: '/saved-events', icon: '💾' }
    ];

    const categories = [
        { name: 'Music', icon: '🎵', href: '/events?category=CONCERT' },
        { name: 'Tech', icon: '💻', href: '/events?category=TECHNOLOGY' },
        { name: 'Sports', icon: '⚽', href: '/events?category=SPORTS' },
        { name: 'Art', icon: '🎨', href: '/events?category=ARTS' },
        { name: 'Food', icon: '🍕', href: '/events?category=FOOD' }
    ];

    // Render Clean Organizer Sidebar
    if (isOrganizer) {
        return (
            <aside className="w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-50 flex flex-col shadow-sm">
                {/* Logo */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-indigo-600 rounded-lg p-1.5 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">EventFlow</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {organizerNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100 space-y-4">
                    <Link
                        href="/events/create"
                        className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Event
                    </Link>

                    <button
                        onClick={() => {
                            logout();
                            // Optional: redirect logic handled by AuthContext or use router
                        }}
                        className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>
        );
    }

    // Default Attendee Sidebar
    return (
        <aside className="w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-50 flex flex-col shadow-sm pt-[64px] overflow-y-auto hidden md:flex">
            {/* Calendar Widget */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h3 className="text-sm font-semibold text-gray-900">{currentMonth} {currentYear}</h3>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="text-xs font-medium text-gray-400 py-1">{day.charAt(0)}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {days.map((day, index) => { // Fixed mapping logic for empty cells
                        if (day === null) return <div key={`empty-${index}`} className="invisible"></div>;
                        return (
                            <div
                                key={index}
                                className={`text-xs w-7 h-7 flex items-center justify-center rounded-full mx-auto
                                    ${day === today && isCurrentMonth ? 'bg-indigo-600 text-white font-bold' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
                                `}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 justify-center">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Dashboard Navigation */}
            <nav className="p-4 space-y-1">
                {attendeeNavItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Quick Stats */}
            <div className="px-4 py-3 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Stats</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Upcoming Events</span>
                        <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full text-xs">12</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Saved</span>
                        <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full text-xs">8</span>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-3 border-t border-gray-100 flex-1 overflow-y-auto">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h4>
                <div className="space-y-1">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={category.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm transition-all">
                    <span>⚙️</span>
                    <span>Settings</span>
                </Link>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-white hover:shadow-sm transition-all text-left"
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
