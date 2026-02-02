'use client';

import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();

    const isAuthPage = pathname?.startsWith('/auth');

    if (isAuthenticated) {
        return (
            <>
                <Navbar />
                <div className="app-layout">
                    <Sidebar />
                    <main className="main-with-sidebar">
                        {children}
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            {!isAuthPage && <Navbar />}
            {children}
        </>
    );
}
