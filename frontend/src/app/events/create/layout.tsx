'use client';

import Sidebar from '../../../components/Sidebar';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateEventLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
            router.push('/dashboard/attendee');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                {/* Top Header Bar */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
                    <div className="flex items-center justify-end">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Welcome, <span className="font-semibold text-gray-900">Event Organizer</span>
                            </span>
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/');
                                }}
                                className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
}

