import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { HealthCheck } from './components/HealthCheck';

// Organizer/Admin Layout & Pages
import { OrganizerLayout } from './layouts/OrganizerLayout';
import { Dashboard } from './pages/Dashboard';
import { EventList } from './components/EventList';
import { CreateEvent } from './components/CreateEvent';
import { Attendees } from './components/Attendees';
import { Settings } from './components/Settings';
import { AdminDashboard } from './pages/AdminDashboard';

// Attendee Layout & Pages
import { AttendeeDashboard } from './pages/AttendeeDashboard';

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

            {/* Attendee Routes */}
            <Route 
              path="/attendee" 
              element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeDashboard />
                </ProtectedRoute>
              } 
            />

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
              <Route path="attendees" element={<Attendees />} />
              <Route path="settings" element={<Settings />} />
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
