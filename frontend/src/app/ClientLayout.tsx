'use client';

import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const pathname = usePathname();

    const isAuthPage = pathname?.startsWith('/auth');
    const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
    const isHomePage = pathname === '/';

    if (isAuthenticated) {
        if (isOrganizer) {
            return (
                <div className="min-h-screen bg-gray-50">
                    <Sidebar />
                    <Navbar />
                    <main className="pt-16">
                        {children}
                    </main>
                </div>
            );
        }

        // Attendee Layout - Full Width, No Sidebar
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-white pt-16">
                    {children}
                </div>
                <Footer />
            </>
        );
    }

    // Guest/Unauthenticated Layout
    return (
        <>
            {!isAuthPage && <Navbar />}
            <div className={`min-h-screen bg-white ${isHomePage ? '' : 'pt-16'}`}>
                {children}
            </div>
            {!isAuthPage && <Footer />}
        </>
    );
}
