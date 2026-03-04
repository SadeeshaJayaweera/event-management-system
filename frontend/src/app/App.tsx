import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { HealthCheck } from './components/HealthCheck';
import { Checkout } from './components/Checkout';
import { PaymentSuccess } from './components/PaymentSuccess';

// Organizer/Admin Layout & Pages
import { OrganizerLayout } from './layouts/OrganizerLayout';
import { Dashboard } from './pages/Dashboard';
import { EventList } from './components/EventList';
import { CreateEvent } from './components/CreateEvent';
import { EditEvent } from './components/EditEvent';
import { EventDetail } from './pages/EventDetail';
import { Attendees } from './components/Attendees';
import { Settings } from './components/Settings';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationList } from './components/NotificationList';

// Attendee Layout & Pages
import { AttendeeLayout } from './layouts/AttendeeLayout';
import { AttendeeDashboard } from './pages/AttendeeDashboard';
import { DiscoverEvents } from './pages/DiscoverEvents';
import { MyTickets } from './pages/MyTickets';
import { AttendeeEventDetail } from './pages/AttendeeEventDetail';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />

            {/* Attendee Routes */}
            <Route
              path="/attendee"
              element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AttendeeDashboard />} />
              <Route path="discover" element={<DiscoverEvents />} />
              <Route path="events/:id" element={<AttendeeEventDetail />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="checkout/:eventId" element={<Checkout />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<NotificationList />} />
            </Route>

            {/* Organizer & Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole={['organizer', 'admin']}>
                  <OrganizerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="events" element={<EventList />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/edit/:id" element={<EditEvent />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="attendees" element={<Attendees />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationList />} />
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Fallback - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
