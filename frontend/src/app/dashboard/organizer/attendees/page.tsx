'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { eventService } from '../../../../services/eventService';
import { bookingService } from '../../../../services/bookingService';
import { Event, Booking } from '../../../../types';

interface AttendeeData {
    id: number;
    name: string;
    email: string;
    event: string;
    status: 'Confirmed' | 'Pending' | 'Checked In' | 'Cancelled';
    date: string;
    initials: string;
    avatarColor: string;
}

export default function OrganizerAttendeesPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [attendees, setAttendees] = useState<AttendeeData[]>([]);
    const [filteredAttendees, setFilteredAttendees] = useState<AttendeeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
                router.push('/auth/login');
            } else if (user) {
                fetchAttendees();
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    const getAvatarColor = (index: number) => {
        const colors = [
            'bg-indigo-100 text-indigo-700',
            'bg-blue-100 text-blue-700',
            'bg-purple-100 text-purple-700',
            'bg-pink-100 text-pink-700',
            'bg-green-100 text-green-700',
        ];
        return colors[index % colors.length];
    };

    const fetchAttendees = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const events = await eventService.getEventsByOrganizer(user.id);
            const allBookings: AttendeeData[] = [];

            for (const event of events) {
                try {
                    const bookings = await bookingService.getBookingsByEvent(event.id);
                    bookings.forEach((booking: Booking, index: number) => {
                        const nameParts = booking.userName?.split(' ') || ['User'];
                        const initials = nameParts.map((n: string) => n.charAt(0).toUpperCase()).slice(0, 2).join('');

                        allBookings.push({
                            id: booking.id,
                            name: booking.userName || 'Unknown User',
                            email: booking.userEmail || '',
                            event: event.title,
                            status: mapBookingStatus(booking.bookingStatus),
                            date: new Date(booking.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            }),
                            initials: initials || 'U',
                            avatarColor: getAvatarColor(index),
                        });
                    });
                } catch (err) {
                    console.error(`Failed to fetch bookings for event ${event.id}:`, err);
                }
            }

            // If no data from backend, use mock data
            if (allBookings.length === 0) {
                const mockAttendees = getMockAttendees();
                setAttendees(mockAttendees);
                setFilteredAttendees(mockAttendees);
            } else {
                setAttendees(allBookings);
                setFilteredAttendees(allBookings);
            }
        } catch (error) {
            console.error('Failed to fetch attendees:', error);
            const mockAttendees = getMockAttendees();
            setAttendees(mockAttendees);
            setFilteredAttendees(mockAttendees);
        } finally {
            setLoading(false);
        }
    };

    const getMockAttendees = (): AttendeeData[] => [
        {
            id: 1,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            event: 'Tech Summit 2026',
            status: 'Confirmed',
            date: '2026-01-15',
            initials: 'AJ',
            avatarColor: 'bg-indigo-100 text-indigo-700',
        },
        {
            id: 2,
            name: 'Bob Smith',
            email: 'bob@example.com',
            event: 'Tech Summit 2026',
            status: 'Pending',
            date: '2026-01-16',
            initials: 'BS',
            avatarColor: 'bg-blue-100 text-blue-700',
        },
        {
            id: 3,
            name: 'Charlie Davis',
            email: 'charlie@example.com',
            event: 'Summer Music Festival',
            status: 'Confirmed',
            date: '2026-01-20',
            initials: 'CD',
            avatarColor: 'bg-purple-100 text-purple-700',
        },
        {
            id: 4,
            name: 'Diana Prince',
            email: 'diana@example.com',
            event: 'Future of Work Workshop',
            status: 'Checked In',
            date: '2026-01-22',
            initials: 'DP',
            avatarColor: 'bg-pink-100 text-pink-700',
        },
        {
            id: 5,
            name: 'Evan Wright',
            email: 'evan@example.com',
            event: 'Startup Networking Night',
            status: 'Cancelled',
            date: '2026-02-01',
            initials: 'EW',
            avatarColor: 'bg-green-100 text-green-700',
        },
    ];

    const mapBookingStatus = (status: string): AttendeeData['status'] => {
        switch (status) {
            case 'CONFIRMED':
            case 'PAID':
                return 'Confirmed';
            case 'PENDING':
                return 'Pending';
            case 'COMPLETED':
                return 'Checked In';
            case 'CANCELLED':
            case 'REFUNDED':
                return 'Cancelled';
            default:
                return 'Pending';
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const filtered = attendees.filter(
                (a) =>
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.event.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredAttendees(filtered);
        } else {
            setFilteredAttendees(attendees);
        }
    }, [searchQuery, attendees]);

    const getStatusStyle = (status: AttendeeData['status']) => {
        const styles = {
            'Confirmed': 'bg-green-50 text-green-700 border-green-200',
            'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'Checked In': 'bg-blue-50 text-blue-700 border-blue-200',
            'Cancelled': 'bg-red-50 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status: AttendeeData['status']) => {
        switch (status) {
            case 'Confirmed':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'Pending':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'Checked In':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'Cancelled':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Event', 'Status', 'Date'];
        const csvData = filteredAttendees.map(a => [a.name, a.email, a.event, a.status, a.date]);
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendees-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
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
                    <h1 className="text-3xl font-bold text-gray-900">Attendees</h1>
                    <p className="text-gray-600 mt-1">Manage registrations and guest lists.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, email, or event..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Attendees Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredAttendees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
                                        <p className="text-gray-600">
                                            {searchQuery
                                                ? 'Try adjusting your search'
                                                : 'Attendees will appear here once they register for your events'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAttendees.map((attendee) => (
                                <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${attendee.avatarColor}`}>
                                                <span className="font-semibold text-sm">
                                                    {attendee.initials}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{attendee.name}</p>
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {attendee.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{attendee.event}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(attendee.status)}`}>
                                            {getStatusIcon(attendee.status)}
                                            {attendee.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {attendee.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
