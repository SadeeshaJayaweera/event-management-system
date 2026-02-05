'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import { Event, Booking } from '../../types';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchDashboardData();
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user, authLoading]);

    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            // Parallel fetching for better performance
            const promises: Promise<any>[] = [bookingService.getBookingsByUser(user.id)];

            if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
                promises.push(eventService.getEventsByOrganizer(user.id));
            }

            const results = await Promise.all(promises);
            setMyBookings(results[0]);
            if (results[1]) {
                setMyEvents(results[1]);
            }

        } catch (error) {
            console.error("Dashboard data load failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (isAuthenticated && loading)) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="spinner w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl text-center">
                <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
                <p className="text-gray-600 mb-6">Access your dashboard to manage events and tickets.</p>
                <Link href="/auth/login" className="btn btn-primary w-full justify-center">Login to Dashboard</Link>
            </div>
        );
    }

    const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 mb-10 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
                    <p className="opacity-90 max-w-2xl text-lg">
                        {isOrganizer
                            ? "Check your event performance and manage your upcoming schedule."
                            : "Ready for your next adventure? Check your upcoming bookings below."}
                    </p>
                    <div className="mt-6 flex gap-3">
                        <Link href="/events" className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-sm inline-flex items-center gap-2">
                            <span>🔍</span> Browse Events
                        </Link>
                        {isOrganizer && (
                            <Link href="/events/create" className="bg-indigo-500 bg-opacity-30 border border-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                                <span>➕</span> Create Event
                            </Link>
                        )}
                    </div>
                </div>
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 opacity-10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/4"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mr-4">🎫</div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">{myBookings.length}</h3>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tickets Purchased</p>
                    </div>
                </div>

                {isOrganizer && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mr-4">📅</div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900">{myEvents.length}</h3>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Events Organized</p>
                        </div>
                    </div>
                )}

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl mr-4">🔔</div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">0</h3>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Notifications</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity / Bookings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Your Tickets</h2>
                        <Link href="/my-tickets" className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center group">
                            View All <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                    {myBookings.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {myBookings.slice(0, 5).map(booking => (
                                <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm
                                        ${booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {booking.bookingStatus === 'CONFIRMED' ? '✓' : '⧖'}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 line-clamp-1">{booking.eventTitle}</h4>
                                            <p className="text-xs text-gray-500">{new Date(booking.eventDateTime).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border
                                    ${booking.bookingStatus === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                        {booking.bookingStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            <p className="mb-4">No recent bookings found.</p>
                            <Link href="/events" className="text-indigo-500 font-medium hover:underline">Start exploring events</Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions or Organizer Stats */}
                {isOrganizer ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Your Events</h2>
                            <Link href="/my-events" className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center group">
                                Manage All <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                        {myEvents.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {myEvents.slice(0, 5).map(event => (
                                    <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-lg shadow-sm font-bold text-indigo-600">
                                                {event.title.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h4>
                                                <p className="text-xs text-gray-500">Sold: {Math.max(0, event.capacity - event.availableSeats)}/{event.capacity}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold
                                        ${event.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center text-gray-500">
                                <p className="mb-4">You haven&apos;t created any events yet.</p>
                                <Link href="/events/create" className="text-indigo-500 font-medium hover:underline">Create an event now</Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl mb-4">🚀</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Become an Organizer</h3>
                        <p className="text-gray-600 mb-6">Want to host your own events? Upgrade your account to start creating and managing events.</p>
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-md">
                            Upgrade Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
