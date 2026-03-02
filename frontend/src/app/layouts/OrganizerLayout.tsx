import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Calendar } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { ProfileDropdown } from '../components/ProfileDropdown';
import { NotificationBell } from '../components/NotificationBell';
import { useAuth } from '../contexts/AuthContext';

export function OrganizerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Convert URL path to active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/dashboard/events/create')) return 'create-event';
    if (path.startsWith('/dashboard/events')) return 'events';
    if (path.startsWith('/dashboard/attendees')) return 'attendees';
    if (path.startsWith('/dashboard/admin')) return 'admin';
    if (path.startsWith('/dashboard/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: string) => {
    const routes: Record<string, string> = {
      dashboard: '/dashboard',
      events: '/dashboard/events',
      'create-event': '/dashboard/events/create',
      attendees: '/dashboard/attendees',
      admin: '/dashboard/admin',
      settings: '/dashboard/settings',
    };
    navigate(routes[tab] || '/dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 z-10 shadow-sm">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onLogout={handleLogout} 
          userRole={user?.role} 
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-20 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900">EventFlow</span>
        </a>
        <div className="flex items-center space-x-2">
          <NotificationBell />
          <ProfileDropdown />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left duration-300">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange} 
              onLogout={handleLogout} 
              userRole={user?.role} 
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header with Profile Dropdown */}
          <div className="flex justify-between items-center mb-6">
            <div className="hidden md:block">
              <span className="text-sm font-medium text-gray-600">
                Welcome back, {user?.name}
              </span>
            </div>
            <div className="ml-auto flex items-center space-x-3">
              <div className="hidden md:block">
                <NotificationBell />
              </div>
              <ProfileDropdown />
            </div>
          </div>
          
          <Outlet />
        </div>
      </main>
    </div>
  );
}
