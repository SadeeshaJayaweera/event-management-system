import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, Users, Shield, ArrowRight, CheckCircle, Star, MapPin, Clock, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { eventApi, type EventItem } from "../services/eventflow";
import { EventCardSkeleton } from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../services/eventflow";

export function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventApi.list();
        setEvents(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="/"><div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">EventFlow</span>
            </div>
            </a>
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    const dashboards: Record<UserRole, string> = {
                      attendee: '/attendee',
                      organizer: '/dashboard',
                      admin: '/dashboard',
                    };
                    navigate(dashboards[user.role]);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
                  >
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.name}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-indigo-600 capitalize">{user.role}</p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          toast.success('Logged out successfully');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/auth?mode=login')}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/auth?mode=register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
              Event Management <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Reimagined</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform for organizers to host stunning events and for attendees to discover unforgettable experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated && user ? (
                <button 
                  onClick={() => {
                    const dashboards: Record<UserRole, string> = {
                      attendee: '/attendee',
                      organizer: '/dashboard',
                      admin: '/dashboard',
                    };
                    navigate(dashboards[user.role]);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/auth?mode=register')}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                  >
                    Start for Free <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    Watch Demo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-end mb-12">
             <div>
                <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
                <p className="mt-4 text-lg text-gray-600">Discover what's trending this month.</p>
             </div>
             {!isAuthenticated && (
               <button onClick={() => navigate('/auth?mode=register')} className="hidden md:flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                  View all events <ArrowRight className="w-4 h-4 ml-1" />
               </button>
             )}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                <>
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                </>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                     <div className="relative h-48 overflow-hidden">
                        <img src={event.imageUrl || "https://images.unsplash.com/photo-1515162305285-9dc6f8630e84?auto=format&fit=crop&w=800&q=80"} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-900 shadow-sm">
                           ${event.price}
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-wide">
                              {event.category}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                           {event.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                           <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{event.location}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{event.date} at {event.time}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No upcoming events available at the moment.
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern event management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Easy Event Creation", description: "Create and publish events in minutes with our intuitive interface" },
              { icon: Users, title: "Attendee Management", description: "Track registrations, send updates, and manage check-ins seamlessly" },
              { icon: Shield, title: "Secure & Reliable", description: "Enterprise-grade security with 99.9% uptime guarantee" }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm">
                  Learn more <CheckCircle className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Trusted by Event Professionals Worldwide</h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of organizers who have streamlined their event management with EventFlow.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time analytics and reporting",
                  "Automated email notifications",
                  "Customizable event pages",
                  "Integrated ticketing system"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl transform rotate-3 opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1511171735792-048024585d63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBuZXR3b3JraW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDI3MDA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                alt="Event Networking" 
                className="relative rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-50 max-w-xs">
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-800 font-medium italic">"EventFlow completely transformed how we handle our annual tech summit. Highly recommended!"</p>
                <p className="text-gray-500 text-sm mt-2">- Sarah J., Tech Events Lead</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Calendar className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold">EventFlow</span>
              </div>
              <p className="text-gray-400 text-sm">Making events memorable, one click at a time.</p>
            </div>
            
            {['Product', 'Company', 'Resources'].map((col) => (
              <div key={col}>
                <h3 className="font-bold mb-4">{col}</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Case Studies</li>
                  <li>API</li>
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2026 EventFlow Inc. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <Link to="/health" className="text-blue-400 hover:text-blue-300">System Health</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
