'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isAuthenticated) {
        return (
            <div className="flex-center min-h-screen">
                <div className="card text-center p-xl">
                    <h2>Access Denied</h2>
                    <p className="mb-lg">Please login to view your profile.</p>
                    <Link href="/auth/login" className="btn btn-primary">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Name:</label>
                    <p className="text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'N/A'}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Email:</label>
                    <p className="text-gray-900">{user?.email || 'N/A'}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Role:</label>
                    <p className="text-gray-900">{user?.role || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}
