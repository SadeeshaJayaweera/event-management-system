'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { eventService } from '../../../services/eventService';
import { Event } from '../../../types';
import Link from 'next/link';

interface DashboardStats {
    totalRevenue: number;
    totalAttendees: number;
    eventsHosted: number;
    avgTicketPrice: number;
}

interface ChartDataPoint {
    month: string;
    revenue: number;
}

export default function OrganizerDashboard() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 425800,
        totalAttendees: 8245,
        eventsHosted: 124,
        avgTicketPrice: 185,
    });

    // Revenue chart data - matching the screenshot curve
    const chartData: ChartDataPoint[] = [
        { month: 'Jan', revenue: 3800 },
        { month: 'Feb', revenue: 3200 },
        { month: 'Mar', revenue: 2800 },
        { month: 'Apr', revenue: 2600 },
        { month: 'May', revenue: 1890 },
        { month: 'Jun', revenue: 2400 },
        { month: 'Jul', revenue: 3600 },
    ];

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
                router.push('/auth/login');
            } else if (user) {
                fetchOrganizerData();
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    const fetchOrganizerData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const organizerEvents = await eventService.getEventsByOrganizer(user.id);
            const sortedEvents = [...organizerEvents].sort((a, b) =>
                new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
            );
            setEvents(sortedEvents);

            // Calculate stats from real data if available
            if (organizerEvents.length > 0) {
                let totalRevenue = 0;
                let totalAttendees = 0;
                let totalPrice = 0;

                organizerEvents.forEach(event => {
                    const soldTickets = event.capacity - event.availableSeats;
                    totalAttendees += soldTickets;
                    totalRevenue += event.price * soldTickets;
                    totalPrice += event.price;
                });

                if (totalRevenue > 0 || totalAttendees > 0) {
                    setStats({
                        totalRevenue,
                        totalAttendees,
                        eventsHosted: organizerEvents.length,
                        avgTicketPrice: organizerEvents.length > 0 ? Math.round(totalPrice / organizerEvents.length) : 0,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch organizer data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get upcoming events or mock data
    const upcomingEvents = events.filter(e => new Date(e.eventDate) >= new Date()).slice(0, 3);
    const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : [
        {
            id: 1,
            title: 'Tech Summit 2026',
            eventDate: '2026-03-15',
            location: 'San Francisco, CA',
            thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200',
        },
        {
            id: 2,
            title: 'Summer Music Festival',
            eventDate: '2026-06-20',
            location: 'Austin, TX',
            thumbnailUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200',
        },
        {
            id: 3,
            title: 'Future of Work Workshop',
            eventDate: '2026-02-10',
            location: 'New York, NY',
            thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=200',
        },
    ];

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Chart calculations
    const maxRevenue = 4000;
    const chartHeight = 280;
    const chartWidth = 600;
    const paddingLeft = 50;
    const paddingBottom = 30;
    const paddingTop = 20;
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    const usableWidth = chartWidth - paddingLeft;

    const getY = (revenue: number) => {
        return paddingTop + usableHeight - (revenue / maxRevenue) * usableHeight;
    };

    const getX = (index: number) => {
        return paddingLeft + (index / (chartData.length - 1)) * usableWidth;
    };

    // Generate smooth curve path
    const generatePath = () => {
        const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d.revenue) }));

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const midX = (p0.x + p1.x) / 2;
            path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
        }

        return path;
    };

    const generateAreaPath = () => {
        const linePath = generatePath();
        const lastPoint = chartData.length - 1;
        return `${linePath} L ${getX(lastPoint)} ${chartHeight - paddingBottom} L ${getX(0)} ${chartHeight - paddingBottom} Z`;
    };

    return (
        <main className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with your events.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-green-500">+12.5%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>

                {/* Total Attendees */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-green-500">+8.2%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Attendees</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalAttendees.toLocaleString()}</p>
                </div>

                {/* Events Hosted */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-green-500">+24%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Events Hosted</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.eventsHosted}</p>
                </div>

                {/* Avg Ticket Price */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-red-500">-2.1%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Avg. Ticket Price</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.avgTicketPrice}</p>
                </div>
            </div>

            {/* Revenue Analytics and Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Analytics Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Analytics</h2>

                    <div className="relative" style={{ height: chartHeight }}>
                        <svg
                            className="w-full h-full"
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            preserveAspectRatio="xMidYMid meet"
                        >
                            {/* Y-axis labels */}
                            <text x="40" y={getY(4000) + 4} className="text-xs fill-gray-400" textAnchor="end">$4000</text>
                            <text x="40" y={getY(3000) + 4} className="text-xs fill-gray-400" textAnchor="end">$3000</text>
                            <text x="40" y={getY(2000) + 4} className="text-xs fill-gray-400" textAnchor="end">$2000</text>
                            <text x="40" y={getY(1000) + 4} className="text-xs fill-gray-400" textAnchor="end">$1000</text>
                            <text x="40" y={getY(0) + 4} className="text-xs fill-gray-400" textAnchor="end">$0</text>

                            {/* Horizontal grid lines */}
                            {[4000, 3000, 2000, 1000, 0].map((value) => (
                                <line
                                    key={value}
                                    x1={paddingLeft}
                                    y1={getY(value)}
                                    x2={chartWidth}
                                    y2={getY(value)}
                                    stroke="#f3f4f6"
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Gradient definition */}
                            <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 0.3 }} />
                                    <stop offset="100%" style={{ stopColor: '#818cf8', stopOpacity: 0.02 }} />
                                </linearGradient>
                            </defs>

                            {/* Area fill */}
                            <path
                                d={generateAreaPath()}
                                fill="url(#areaGradient)"
                            />

                            {/* Line */}
                            <path
                                d={generatePath()}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data points and interactive areas */}
                            {chartData.map((point, i) => (
                                <g key={point.month}>
                                    {/* Invisible larger hit area for hover */}
                                    <circle
                                        cx={getX(i)}
                                        cy={getY(point.revenue)}
                                        r="20"
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredPoint(i)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {/* Visible point */}
                                    <circle
                                        cx={getX(i)}
                                        cy={getY(point.revenue)}
                                        r={hoveredPoint === i ? 6 : 4}
                                        fill={hoveredPoint === i ? '#6366f1' : 'white'}
                                        stroke="#6366f1"
                                        strokeWidth="2"
                                    />
                                </g>
                            ))}

                            {/* X-axis labels */}
                            {chartData.map((point, i) => (
                                <text
                                    key={point.month}
                                    x={getX(i)}
                                    y={chartHeight - 5}
                                    className="text-xs fill-gray-400"
                                    textAnchor="middle"
                                >
                                    {point.month}
                                </text>
                            ))}
                        </svg>

                        {/* Tooltip */}
                        {hoveredPoint !== null && (
                            <div
                                className="absolute bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 pointer-events-none z-10"
                                style={{
                                    left: `${(getX(hoveredPoint) / chartWidth) * 100}%`,
                                    top: `${(getY(chartData[hoveredPoint].revenue) / chartHeight) * 100 - 15}%`,
                                    transform: 'translate(-50%, -100%)',
                                }}
                            >
                                <p className="text-sm font-semibold text-gray-900">{chartData[hoveredPoint].month}</p>
                                <p className="text-sm text-indigo-600">Revenue : ${chartData[hoveredPoint].revenue}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>

                    <div className="space-y-4">
                        {displayEvents.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="flex items-start gap-4 hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                    {event.thumbnailUrl ? (
                                        <img
                                            src={event.thumbnailUrl}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white text-lg font-bold">{event.title.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-base mb-1">{event.title}</h3>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-0.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {event.eventDate}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {event.location}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <Link
                        href="/dashboard/organizer/events"
                        className="block mt-6 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        View All Events
                    </Link>
                </div>
            </div>
        </main>
    );
}
