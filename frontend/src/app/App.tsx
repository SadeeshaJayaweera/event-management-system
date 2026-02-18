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
import { HealthCheck } from "./components/HealthCheck";
import { Checkout } from "./components/Checkout";
import { PaymentSuccess } from "./components/PaymentSuccess";
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
  const [view, setView] = useState<"landing" | "auth" | "app" | "health" | "checkout" | "payment_success">("landing");
  const [user, setUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Check for health check route
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/health' || window.location.hash === '#/health') {
      setView('health');
    } else if (path === '/payment/success') {
      setView('payment_success');
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

  const handleBuyTickets = (event: EventItem) => {
    if (!user) {
      toast.error("Please login to purchase tickets");
      setView("auth");
      return;
    }
    setSelectedEvent(event);
    setView("checkout");
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
    switch (activeTab) {
      case "dashboard": return <Dashboard events={events} />;
      case "events": return <EventList events={events} onCreateClick={() => setActiveTab("create-event")} onBuyTickets={handleBuyTickets} />;
      case "create-event": return <CreateEvent onSave={handleCreateEvent} onCancel={() => setActiveTab("events")} />;
      case "attendees": return <Attendees />;
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

    if (view === "checkout") {
      // Mocking location state for Checkout component since we aren't using router context fully here
      // or we need to update Checkout to accept props.
      // The previous Checkout.tsx used useLocation().
      // Let's wrap it or mock it? 
      // Better: Update Checkout.tsx to accept props OR use a Provider if react-router is active.
      // Given `App.tsx` manual routing, `Checkout` using `useLocation` might fail if not inside <BrowserRouter>.
      // `main.tsx` has the router? checking...
      // If main.tsx has BrowserRouter, useLocation works.
      // But we are passing state via navigation which we are not doing with standard router here.
      // We'll pass state via a Context or modify Checkout to take props.
      // Modifying Checkout to take props is safer.
      // BUT, I can't modify Checkout in this tool call.
      // Use a wrapper or assume Main.tsx has Router and we use `navigate`?
      // Let's assume passed props for now if I modify Checkout. 
      // WAIT: I can just pass the event as a prop to Checkout if I update it.
      // For now, let's render it and see.
      // Actually, I'll update Checkout.tsx in next step to accept props to be safe.
      return <Checkout event={selectedEvent!} onBack={() => setView("app")} />;
    }

    if (view === "payment_success") {
      return <PaymentSuccess onHome={() => setView("app")} />;
    }

    if (user?.role === "attendee") {
      return <AttendeeDashboard user={user} onLogout={handleLogout} />;
    }

    // Organizer View
    return (
      <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 z-10 shadow-sm">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
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
              <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} onLogout={handleLogout} />
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
