'use client';

import React from 'react';
import Link from 'next/link';

interface EventSummary {
    id: string | number;
    title: string;
    date: string;
    location: string;
    imageUrl?: string;
    category: string;
}

interface UpcomingEventsProps {
    events: EventSummary[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {events.length > 0 ? (
                    events.map((event, index) => (
                        <div key={event.id || index} className="group flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative shadow-sm">
                                {event.imageUrl ? (
                                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-white font-bold text-lg
                    ${index % 3 === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : index % 3 === 1 ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}
                  `}>
                                        {event.category ? event.category.charAt(0) : event.title.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 pt-1">
                                <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors text-[15px]">
                                    {event.title}
                                </h4>
                                <div className="mt-1 space-y-1">
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {event.date}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {event.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>No upcoming events</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <Link href="/dashboard/organizer/events" className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors inline-flex items-center">
                    View All Events
                </Link>
            </div>
        </div>
    );
}
