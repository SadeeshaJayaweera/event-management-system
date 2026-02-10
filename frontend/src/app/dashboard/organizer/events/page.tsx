'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { eventService } from '../../../../services/eventService';
import { Event, EventCategory } from '../../../../types';

export default function OrganizerEventsPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
                router.push('/auth/login');
            } else if (user) {
                fetchEvents();
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    const fetchEvents = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await eventService.getEventsByOrganizer(user.id);
            setEvents(data);
            setFilteredEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            // Use mock data for demo
            const mockEvents = getMockEvents();
            setEvents(mockEvents);
            setFilteredEvents(mockEvents);
        } finally {
            setLoading(false);
        }
    };

    const getMockEvents = (): Event[] => [
        {
            id: 1,
            title: 'Tech Summit 2026',
            description: 'The biggest tech conference of the year featuring industry leaders and innovative workshops.',
            eventDate: '2026-03-15',
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            location: 'San Francisco, CA',
            capacity: 2000,
            availableSeats: 760,
            price: 299,
            category: 'TECHNOLOGY' as EventCategory,
            organizerId: user?.id || 1,
            status: 'PUBLISHED' as const,
            imageUrls: [],
            thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
            featured: true,
            createdAt: '',
            updatedAt: '',
        },
        {
            id: 2,
            title: 'Summer Music Festival',
            description: 'Three days of non-stop music, food, and fun under the summer sun.',
            eventDate: '2026-06-20',
            startTime: '04:00 PM',
            endTime: '11:00 PM',
            location: 'Austin, TX',
            capacity: 10000,
            availableSeats: 4600,
            price: 150,
            category: 'CONCERT' as EventCategory,
            organizerId: user?.id || 1,
            status: 'PUBLISHED' as const,
            imageUrls: [],
            thumbnailUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600',
            featured: true,
            createdAt: '',
            updatedAt: '',
        },
        {
            id: 3,
            title: 'Future of Work Workshop',
            description: 'Interactive session on remote work strategies and team building.',
            eventDate: '2026-02-10',
            startTime: '10:00 AM',
            endTime: '04:00 PM',
            location: 'New York, NY',
            capacity: 100,
            availableSeats: 15,
            price: 499,
            category: 'BUSINESS' as EventCategory,
            organizerId: user?.id || 1,
            status: 'COMPLETED' as const,
            imageUrls: [],
            thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600',
            featured: false,
            createdAt: '',
            updatedAt: '',
        },
        {
            id: 4,
            title: 'Startup Networking Night',
            description: 'Connect with founders, investors, and professionals in a relaxed rooftop setting.',
            eventDate: '2026-02-28',
            startTime: '06:30 PM',
            endTime: '10:00 PM',
            location: 'Chicago, IL',
            capacity: 300,
            availableSeats: 100,
            price: 50,
            category: 'NETWORKING' as EventCategory,
            organizerId: user?.id || 1,
            status: 'PUBLISHED' as const,
            imageUrls: [],
            thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
            featured: false,
            createdAt: '',
            updatedAt: '',
        },
    ];

    useEffect(() => {
        let result = events;

        // Apply search filter
        if (searchQuery) {
            result = result.filter(event =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== 'All') {
            result = result.filter(event => {
                const categoryMap: Record<string, string[]> = {
                    'Technology': ['TECHNOLOGY', 'CONFERENCE'],
                    'Music': ['CONCERT', 'MUSIC'],
                    'Business': ['BUSINESS', 'WORKSHOP'],
                    'Networking': ['NETWORKING'],
                };
                return categoryMap[selectedCategory]?.includes(event.category);
            });
        }

        setFilteredEvents(result);
    }, [searchQuery, selectedCategory, events]);

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'TECHNOLOGY': 'Technology',
            'CONCERT': 'Music',
            'BUSINESS': 'Business',
            'NETWORKING': 'Networking',
            'CONFERENCE': 'Technology',
            'WORKSHOP': 'Business',
            'MUSIC': 'Music',
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'TECHNOLOGY': 'bg-indigo-100 text-indigo-700',
            'CONCERT': 'bg-purple-100 text-purple-700',
            'BUSINESS': 'bg-orange-100 text-orange-700',
            'NETWORKING': 'bg-blue-100 text-blue-700',
            'CONFERENCE': 'bg-indigo-100 text-indigo-700',
            'WORKSHOP': 'bg-orange-100 text-orange-700',
            'MUSIC': 'bg-purple-100 text-purple-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadge = (event: Event) => {
        const eventDate = new Date(event.eventDate);
        const today = new Date('2026-02-09'); // Current date from context

        if (event.status === 'COMPLETED' || eventDate < today) {
            return { label: 'Completed', class: 'bg-gray-700 text-white' };
        }
        return { label: 'Upcoming', class: 'bg-green-600 text-white' };
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-600 mt-1">Manage and organize your upcoming events.</p>
                </div>
                <Link
                    href="/events/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex gap-2 flex-wrap">
                        {['All', 'Technology', 'Music', 'Business', 'Networking'].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery || selectedCategory !== 'All'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first event'}
                    </p>
                    {!searchQuery && selectedCategory === 'All' && (
                        <Link
                            href="/events/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Event
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const status = getStatusBadge(event);
                        const soldTickets = event.capacity - event.availableSeats;

                        return (
                            <div key={event.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    {event.thumbnailUrl ? (
                                        <img
                                            src={event.thumbnailUrl}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white text-4xl font-bold">{event.title.charAt(0)}</span>
                                        </div>
                                    )}
                                    {/* Status Badge */}
                                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold ${status.class}`}>
                                        {status.label}
                                    </div>
                                    {/* Price Badge */}
                                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur rounded-md text-xs font-bold text-gray-900">
                                        ${event.price}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    {/* Category */}
                                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium mb-3 ${getCategoryColor(event.category)}`}>
                                        {getCategoryLabel(event.category)}
                                    </span>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>

                                    {/* Description */}
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                                    {/* Meta Info */}
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit'
                                            })} - {event.startTime}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {event.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            {soldTickets.toLocaleString()} attendees
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                                        >
                                            View Details
                                        </Link>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
