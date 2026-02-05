'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/my-tickets');
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
}
