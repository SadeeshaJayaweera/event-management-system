'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';

export default function MyTicketsPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const data = await bookingService.getBookingsByUser(user.id);
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchBookings();
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
        }
    }, [user, isAuthenticated, authLoading]);

    if (authLoading || (isAuthenticated && loading)) {
        return <div className="flex justify-center p-10"><div className="spinner"></div></div>;
    }

    if (!isAuthenticated) return <div className="section text-center"><p>Please login to view your tickets.</p></div>;

    return (
        <div className="section">
            <div className="section-header">
                <h1 className="section-title">My Tickets</h1>
                <p className="section-subtitle">View your event bookings and tickets</p>
            </div>

            {bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <div key={booking.id} className="card flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold">{booking.eventTitle}</h3>
                                <div className="text-gray-500 mt-1">
                                    <p>📅 {new Date(booking.eventDateTime).toLocaleDateString()} at {new Date(booking.eventDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p>📍 {booking.eventLocation}</p>
                                    <p className="mt-2 text-sm">Reference: #{booking.bookingReference}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="mb-2">
                                    <span className="text-2xl font-bold text-primary-600">{booking.numberOfTickets}</span>
                                    <span className="text-gray-500 ml-1">Tickets</span>
                                </div>
                                <span className={`badge badge-${booking.bookingStatus === 'CONFIRMED' ? 'success' : booking.bookingStatus === 'PENDING' ? 'warning' : 'error'}`}>
                                    {booking.bookingStatus}
                                </span>
                                {booking.bookingStatus === 'CONFIRMED' && (
                                    <button className="btn btn-secondary btn-sm mt-3 block w-full">Download Ticket</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <span className="text-4xl block mb-4">🎫</span>
                    <h3 className="text-xl font-bold">No Tickets Found</h3>
                    <p className="text-gray-500 mb-6">You haven&apos;t purchased any tickets yet.</p>
                    <Link href="/events" className="btn btn-primary">Browse Events</Link>
                </div>
            )}
        </div>
    );
}
