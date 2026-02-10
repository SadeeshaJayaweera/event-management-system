'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { eventService } from '../../../services/eventService';
import { bookingService } from '../../../services/bookingService';
import { Event, Booking } from '../../../types';
import EventCard from '../../../components/EventCard';
import Link from 'next/link';

export default function AttendeeDashboard() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (user && (user.role === 'ORGANIZER' || user.role === 'ADMIN')) {
                router.push('/dashboard/organizer');
            } else if (user) {
                fetchAttendeeData();
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    const fetchAttendeeData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [allEvents, userBookings] = await Promise.all([
                eventService.getAllEvents(),
                bookingService.getBookingsByUser(user.id),
            ]);

            setEvents(allEvents.filter(e => e.status === 'PUBLISHED'));
            setBookings(userBookings);
        } catch (error) {
            console.error('Failed to fetch attendee data:', error);
        } finally {
            setLoading(false);
        }
    };

    const isEventBooked = (eventId: number) => {
        return bookings.some(b => b.eventId === eventId);
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const upcomingBookings = bookings.filter(b => {
        const event = events.find(e => e.id === b.eventId);
        return event && new Date(event.eventDate) >= new Date();
    }).length;

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.firstName}!
                    </h1>
                    <p className="text-gray-600 mt-2">Discover amazing events happening near you</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">My Tickets</p>
                                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Upcoming Events</p>
                                <p className="text-3xl font-bold text-gray-900">{upcomingBookings}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Available Events</p>
                                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Search Section */}
                <div className="relative rounded-3xl overflow-hidden mb-12 h-[320px] shadow-lg">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3"
                            alt="Concert Crowd"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/80 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Find your next experience
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 mb-8 font-medium">
                            Discover concerts, workshops, and conferences happening near you.
                        </p>

                        <div className="relative max-w-xl">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all text-sm font-medium"
                                placeholder="Search events, categories, or locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Trending Events Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Trending Events</h2>
                            <p className="text-gray-600 mt-1">Popular events you might like</p>
                        </div>
                        <Link
                            href="/events"
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
                        >
                            View all events
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.slice(0, 6).map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    purchased={isEventBooked(event.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
