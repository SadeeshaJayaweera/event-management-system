'use client';

import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function DebugPage() {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Debug: Current User Info</h1>

                <div className="space-y-4">
                    <div>
                        <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
                    </div>

                    {user && (
                        <>
                            <div>
                                <strong>User ID:</strong> {user.id}
                            </div>
                            <div>
                                <strong>Email:</strong> {user.email}
                            </div>
                            <div>
                                <strong>Name:</strong> {user.firstName} {user.lastName}
                            </div>
                            <div>
                                <strong>Role:</strong> <span className="font-bold text-indigo-600">{user.role}</span>
                            </div>
                        </>
                    )}

                    <div className="pt-4 border-t space-y-2">
                        <h2 className="font-bold">Quick Links:</h2>
                        <div className="space-x-4">
                            <Link href="/dashboard/organizer" className="text-indigo-600 hover:underline">
                                → Organizer Dashboard
                            </Link>
                            <Link href="/dashboard/attendee" className="text-indigo-600 hover:underline">
                                → Attendee Dashboard
                            </Link>
                            <Link href="/auth/register" className="text-indigo-600 hover:underline">
                                → Register New Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

