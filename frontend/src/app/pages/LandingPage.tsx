import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar, Users, Shield, ArrowRight, CheckCircle, Star, MapPin, Clock,
  LogOut, LayoutDashboard, BarChart3, Bell, Ticket, Zap, Globe, Lock,
  ChevronRight, TrendingUp, Award, Headphones
} from "lucide-react";
import { eventApi, type EventItem } from "../services/eventflow";
import { EventCardSkeleton } from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../services/eventflow";

const STATS = [
  { value: "50K+", label: "Events Hosted" },
  { value: "2M+", label: "Happy Attendees" },
  { value: "12K+", label: "Organizers" },
  { value: "99.9%", label: "Uptime SLA" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Event Creation",
    description: "Publish professional events in under 5 minutes with smart templates and guided setup wizards.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    icon: Users,
    title: "Attendee Management",
    description: "Track registrations, send targeted updates, manage waitlists, and handle check-ins seamlessly.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Deep insights into ticket sales, engagement metrics, and revenue with live dashboards.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    icon: Ticket,
    title: "Smart Ticketing",
    description: "Flexible ticket tiers, QR-code entry, and automated PDF delivery for every attendee.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description: "Trigger personalised email & SMS reminders so attendees never miss a moment.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "SOC 2 compliant infrastructure with end-to-end encryption and role-based access control.",
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
  },
];

const STEPS = [
  { step: "01", title: "Create Your Event", description: "Set up your event page with all the details – venue, schedule, speakers, and ticketing options." },
  { step: "02", title: "Promote & Sell", description: "Share across social channels, embed on your website, and watch ticket sales roll in automatically." },
  { step: "03", title: "Manage with Ease", description: "Handle registrations, send updates, and monitor analytics – all from one powerful dashboard." },
  { step: "04", title: "Deliver & Grow", description: "Run a flawless event experience and leverage post-event data to improve your next one." },
];

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Head of Events, TechSummit",
    avatar: "SJ",
    quote: "EventFlow completely transformed how we run our annual tech summit. Registration used to take weeks to set up — now it's done in an afternoon.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Founder, MeetupPro",
    avatar: "MC",
    quote: "The analytics alone are worth the switch. We finally understand our audience and have doubled our repeat attendees in six months.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Corporate Events Manager",
    avatar: "PN",
    quote: "Running multi-city conferences used to be a nightmare. EventFlow's multi-event dashboard gives us a single source of truth across all venues.",
    rating: 5,
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const upcomingEvents = events.slice(0, 3);

  const goToDashboard = () => {
    if (!user) return;
    const dashboards: Record<UserRole, string> = { attendee: "/attendee", organizer: "/dashboard", admin: "/dashboard" };
    navigate(dashboards[user.role]);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 py-4 items-center">
            <a href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-200 transition-shadow">
                <Calendar className="text-white w-5 h-5" />
              </div>
              <span className={`text-xl font-extrabold tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>EventFlow</span>
            </a>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={goToDashboard}
                  className={`flex items-center gap-2 font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10 ${scrolled ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" : "text-white/90 hover:text-white"}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-full transition-all"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${scrolled ? "text-gray-700" : "text-white"}`}>{user.name.split(" ")[0]}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full capitalize">{user.role}</span>
                      </div>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); toast.success("Logged out successfully"); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/auth?mode=login")}
                  className={`font-medium text-sm transition-colors px-4 py-2 rounded-lg ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/auth?mode=register")}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2070&q=85"
            alt="Large event crowd"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/85 via-indigo-950/75 to-violet-950/80" />
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_-20%,rgba(99,102,241,0.35),transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Trusted by 12,000+ event professionals
            </span>
          </div>

          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-[1.05]">
              Event Management<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              The all-in-one platform for organizers to host world-class events and for attendees to discover unforgettable experiences.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated && user ? (
                <button
                  onClick={goToDashboard}
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-bold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-2xl shadow-indigo-900/50 hover:shadow-indigo-700/60 flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/auth?mode=register")}
                    className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-bold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-2xl shadow-indigo-900/50 hover:shadow-indigo-700/60 flex items-center justify-center gap-2"
                  >
                    Start for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 shadow-2xl">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white/5 hover:bg-white/10 transition-colors px-6 py-6 text-center">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/40" />
        </div>
      </div>

      {/* ── Upcoming Events ─────────────────────────────────────────────── */}
      <div className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-14 gap-4">
            <div>
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Live on EventFlow</span>
              <h2 className="mt-2 text-4xl font-black text-gray-900">Upcoming Events</h2>
              <p className="mt-3 text-lg text-gray-500">Discover what's trending this month.</p>
            </div>
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/auth?mode=register")}
                className="group self-start md:self-auto flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                Browse all events <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <><EventCardSkeleton /><EventCardSkeleton /><EventCardSkeleton /></>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="group rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-indigo-900 shadow-lg">
                      LKR {event.price?.toLocaleString()}
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span>{event.date} at {event.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/auth?mode=register")}
                      className="mt-5 w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold text-sm transition-all"
                    >
                      Get Tickets
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No upcoming events at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <div className="py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">Platform Capabilities</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-black text-white mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A complete suite of tools purpose-built for modern event professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-indigo-500/50 hover:bg-gray-800/80 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 -translate-y-16 translate-x-16 transition-opacity duration-500`} />
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 bg-gradient-to-br ${f.color} [background-clip:text] [-webkit-background-clip:text] text-transparent`} style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                <div className="mt-5 flex items-center text-indigo-400 font-semibold text-sm group/link">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <div className="py-28 bg-gradient-to-b from-white to-indigo-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-black text-gray-900">How EventFlow Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(100%-16px)] w-8 z-10">
                    <ArrowRight className="w-5 h-5 text-indigo-300" />
                  </div>
                )}
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-shadow h-full">
                  <div className="text-5xl font-black text-indigo-100 mb-4 leading-none">{step.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Social Proof ─────────────────────────────────────────────────── */}
      <div className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Why Thousands Choose Us</span>
              <h2 className="mt-3 text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Trusted by Event Professionals Worldwide
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                From intimate corporate workshops to stadium-scale concerts — EventFlow scales with your ambition.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  { icon: TrendingUp, text: "Real-time analytics and revenue reporting" },
                  { icon: Bell, text: "Automated multi-channel notifications" },
                  { icon: Globe, text: "Fully customisable public event pages" },
                  { icon: Ticket, text: "Integrated QR-code ticketing system" },
                  { icon: Headphones, text: "24/7 dedicated support team" },
                  { icon: Award, text: "SOC 2 Type II certified platform" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/auth?mode=register")}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 shadow-indigo-100"
                >
                  Start Free Today <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl opacity-10 blur-xl" />
              <img
                src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=85"
                alt="Event professionals"
                className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
              {/* Floating review card */}
              <div className="absolute -bottom-8 -left-8 bg-white p-5 rounded-2xl shadow-2xl border border-gray-50 max-w-72">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 text-amber-400 fill-current" />)}
                </div>
                <p className="text-gray-800 font-medium text-sm italic leading-relaxed">
                  "EventFlow completely transformed how we handle our annual tech summit. Highly recommended!"
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">SJ</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Sarah J.</p>
                    <p className="text-xs text-gray-400">Tech Events Lead</p>
                  </div>
                </div>
              </div>
              {/* Floating stats card */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Ticket Sales</p>
                    <p className="text-lg font-black text-gray-900">+127%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <div className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Customer Stories</span>
            <h2 className="mt-3 text-4xl font-black text-gray-900">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, s) => <Star key={s} className="w-4 h-4 text-amber-400 fill-current" />)}
                </div>
                <p className="text-gray-700 leading-relaxed italic flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-7 pt-6 border-t border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <div className="relative py-28 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=2070&q=80"
              alt="Concert crowd"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-violet-900/90" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Ready to Create Your<br />Next Unforgettable Event?
            </h2>
            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
              Join over 12,000 event professionals already building memorable experiences on EventFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/auth?mode=register")}
                className="group px-8 py-4 bg-white text-indigo-700 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all shadow-2xl flex items-center justify-center gap-2"
              >
                Get Started — It's Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/auth?mode=login")}
                className="px-8 py-4 bg-white/10 border border-white/25 text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Sign In
              </button>
            </div>
            <p className="mt-6 text-indigo-300 text-sm">No credit card required · Free forever plan available</p>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold">EventFlow</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Making events memorable, one click at a time. The modern platform for event professionals.
              </p>
              <div className="flex gap-3 pt-2">
                {["TW", "LI", "GH", "YT"].map((s) => (
                  <div key={s} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold cursor-pointer transition-colors">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Resources", links: ["Documentation", "API Reference", "Case Studies", "Support"] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 text-sm text-gray-500">
            <p>© 2026 EventFlow Inc. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <Link to="/health" className="text-indigo-400 hover:text-indigo-300 transition-colors">System Health</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
