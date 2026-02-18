import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { EventList } from "./components/EventList";
import { Attendees } from "./components/Attendees";
import { Settings } from "./components/Settings";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { AttendeeDashboard } from "./components/AttendeeDashboard";
import { CreateEvent } from "./components/CreateEvent";
import { AdminDashboard } from "./components/AdminDashboard";
import { HealthCheck } from "./components/HealthCheck";
import { Menu, Calendar } from "lucide-react";
import { Toaster, toast } from "sonner";
import { authApi, eventApi, type AuthResponse, type EventItem, type UserRole } from "./api/eventflow";

interface User {
  id: string;
  name: string;
  role: UserRole;
  token: string;
}

export default function App() {
  const [view, setView] = useState<"landing" | "auth" | "app" | "health">("landing");
  const [user, setUser] = useState<User | null>(null);

  // Check for health check route
  useEffect(() => {
    if (window.location.pathname === '/health' || window.location.hash === '#/health') {
      setView('health');
    }
  }, []);

  // Organizer State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventApi.list();
        setEvents(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load events");
      }
    };

    loadEvents();
  }, []);

  const handleLogin = (payload: AuthResponse) => {
    setUser({ id: payload.userId, name: payload.name, role: payload.role, token: payload.token });
    setView("app");
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
    setActiveTab("dashboard");
  };

  const handleCreateEvent = async (newEventData: any) => {
    try {
      const createdEvent = await eventApi.create({
        title: newEventData.title,
        category: newEventData.category,
        date: newEventData.date,
        time: newEventData.time,
        location: newEventData.location,
        price: Number(newEventData.price) || 0,
        description: newEventData.description,
        imageUrl: newEventData.image || null,
      });
      setEvents([createdEvent, ...events]);
      setActiveTab("events");
      toast.success("Event created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event");
    }
  };

  const renderOrganizerContent = () => {
    // Prevent non-admin users from accessing admin panel
    if (activeTab === "admin" && user?.role !== "admin") {
      setActiveTab("dashboard");
      toast.error("Access denied: Admin privileges required");
      return <Dashboard events={events} />;
    }

    switch (activeTab) {
      case "dashboard": return <Dashboard events={events} />;
      case "events": return <EventList events={events} onCreateClick={() => setActiveTab("create-event")} />;
      case "create-event": return <CreateEvent onSave={handleCreateEvent} onCancel={() => setActiveTab("events")} />;
      case "attendees": return <Attendees />;
      case "admin": return <AdminDashboard />;
      case "settings": return <Settings />;
      default: return <Dashboard events={events} />;
    }
  };

  const renderContent = () => {
    if (view === "health") {
      return <HealthCheck />;
    }

    if (view === "landing") {
      return <LandingPage events={events} onGetStarted={() => setView("auth")} onLogin={() => setView("auth")} />;
    }

    if (view === "auth") {
      return <AuthPage onLogin={handleLogin} onBack={() => setView("landing")} />;
    }

    if (user?.role === "attendee") {
      return <AttendeeDashboard user={user} onLogout={handleLogout} />;
    }

    // Organizer and Admin View
    return (
      <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 z-10 shadow-sm">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userRole={user?.role} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">EventFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left duration-300">
               <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} onLogout={handleLogout} userRole={user?.role} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header for Organizer Dashboard to show user info/logout */}
            <div className="flex justify-end mb-6">
               <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">
                    Welcome, {user?.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Sign Out
                  </button>
               </div>
            </div>
            
            {renderOrganizerContent()}
          </div>
        </main>
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      {renderContent()}
    </>
  );
}
