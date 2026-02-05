'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/eventService';
import { Event } from '../../types';

export default function MyEventsPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const data = await eventService.getEventsByOrganizer(user.id);
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch my events", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchMyEvents();
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
        }
    }, [user, isAuthenticated, authLoading]);

    if (authLoading || (isAuthenticated && loading)) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) return (
        <div className="max-w-md mx-auto mt-20 text-center">
            <p className="text-xl text-gray-600 mb-4">Please login to view your events.</p>
            <Link href="/auth/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Login</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                    <p className="text-gray-500 mt-1">Manage and track your organized events</p>
                </div>
                <Link href="/events/create" className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150 shadow-md">
                    <span className="mr-2 text-lg">+</span> Create New Event
                </Link>
            </div>

            {events.length > 0 ? (
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {event.thumbnailUrl ? (
                                                        <img className="h-10 w-10 rounded-lg object-cover" src={event.thumbnailUrl} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {event.title.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                                    <div className="text-sm text-gray-500">{event.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{new Date(event.eventDate).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">{event.startTime}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                                    event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 w-24 mb-1">
                                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, ((event.capacity - event.availableSeats) / event.capacity) * 100)}%` }}></div>
                                            </div>
                                            <span>{event.capacity - event.availableSeats} / {event.capacity} sold</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/events/${event.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">View</Link>
                                            <button className="text-gray-400 hover:text-gray-600">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
                    <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📅</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Created</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven&apos;t organized any events yet. Start by creating your first event to reach your audience.</p>
                    <Link href="/events/create" className="btn btn-primary shadow-lg shadow-indigo-200">
                        Create Your First Event
                    </Link>
                </div>
            )}
        </div>
    );
}
