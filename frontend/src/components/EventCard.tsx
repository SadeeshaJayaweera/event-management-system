'use client';

import Link from 'next/link';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  purchased?: boolean;
}

export default function EventCard({ event, purchased = false }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
      <div className="relative h-48 overflow-hidden">
        {event.thumbnailUrl ? (
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <span className="text-indigo-300 text-5xl font-bold">{event.category.charAt(0)}</span>
          </div>
        )}

        {/* Price Badge - Top Right */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-900 shadow-sm">
          ${event.price}
        </div>
      </div>

      <div className="p-6">
        {/* Category Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-wide">
            {event.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {event.title}
        </h3>

        {/* Date & Time */}
        <div className="space-y-2 text-gray-500 text-sm mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(event.eventDate)} • {formatTime(event.startTime)}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Action Button */}
        {purchased ? (
          <button disabled className="w-full py-3 bg-green-50 hover:bg-green-100 text-gray-900 font-semibold rounded-xl transition-colors cursor-default">
            Ticket Purchased
          </button>
        ) : event.status === 'PUBLISHED' ? (
          <Link href={`/events/${event.id}`} className="block w-full text-center py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-colors">
            Get Tickets
          </Link>
        ) : (
          <div className="w-full text-center py-3 bg-gray-50 text-gray-400 font-medium rounded-xl cursor-not-allowed">
            {event.status === 'SOLD_OUT' ? 'Sold Out' : 'Unavailable'}
          </div>
        )}
      </div>
    </div>
  );
}
