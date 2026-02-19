# Frontend Architecture Improvements

## Overview
This document outlines the fundamental architectural improvements made to the EventFlow frontend to enhance user experience, maintainability, and scalability.

## Problems Addressed

### 1. ❌ No URL-Based Routing
**Before:** State-based navigation using view switches
**After:** React Router v6 with proper URL routing
**Benefits:**
- Browser back/forward buttons work correctly
- Deep linking to specific pages
- Better SEO and shareability
- Cleaner code separation

### 2. ❌ No Authentication Persistence
**Before:** Auth state lost on page refresh
**After:** Auth context with localStorage persistence
**Benefits:**
- Users stay logged in across sessions
- Better user experience
- Secure token management

### 3. ❌ No Auth Token in API Requests
**Before:** API calls without authentication headers
**After:** Automatic token injection in all requests
**Benefits:**
- Proper authentication with backend
- Centralized auth management
- Secure API communication

### 4. ❌ No Protected Routes
**Before:** Manual authorization checks in components
**After:** ProtectedRoute component with role-based access
**Benefits:**
- Centralized route protection
- Role-based access control (RBAC)
- Automatic redirects for unauthorized access

### 5. ❌ No Error Boundaries
**Before:** App crashes on unhandled errors
**After:** ErrorBoundary component with graceful error handling
**Benefits:**
- App remains functional during errors
- Better developer experience with error details
- User-friendly error messages

### 6. ❌ No Loading States
**Before:** No feedback during data loading
**After:** Loading components and skeleton loaders
**Benefits:**
- Better perceived performance
- Professional user experience
- Reduced confusion

## New Architecture Components

### 1. Authentication Context (`src/app/contexts/AuthContext.tsx`)
```typescript
// Provides centralized auth state management
const { user, token, login, register, logout, isAuthenticated } = useAuth();
```

**Features:**
- Automatic localStorage persistence
- Token injection into API client
- Type-safe user data
- Loading states during initialization

### 2. Protected Routes (`src/app/components/ProtectedRoute.tsx`)
```typescript
// Protect routes with role-based access control
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

**Features:**
- Single and multiple role support
- Custom redirect paths
- Loading state during auth check
- Automatic role-based redirects

### 3. Error Boundary (`src/app/components/ErrorBoundary.tsx`)
```typescript
// Catches and handles React errors gracefully
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Features:**
- Prevents app crashes
- Shows error details in development
- Recovery options (reload, go home)
- Beautiful error UI

### 4. Loading Components (`src/app/components/LoadingSpinner.tsx`)
```typescript
// Various loading states for better UX
<LoadingSpinner size="lg" text="Loading..." fullScreen />
<CardSkeleton />
<EventCardSkeleton />
```

**Features:**
- Multiple sizes and variants
- Full-screen and inline options
- Skeleton loaders for content
- Smooth animations

### 5. Enhanced API Client (`src/app/api/client.ts`)
```typescript
// Automatic auth token injection
export function setAuthToken(token: string | null);
```

**Features:**
- Automatic Bearer token injection
- Centralized error handling
- Better logging
- Type-safe requests

## Routing Structure

```
/                     → Landing Page (Public)
/auth                 → Login/Register (Public)
/health              → Health Check (Public)

/attendee            → Attendee Dashboard (Protected: attendee role)

/dashboard           → Organizer Layout (Protected: organizer/admin roles)
  ├─ /               → Dashboard Home
  ├─ /events         → Event List
  ├─ /events/create  → Create Event
  ├─ /attendees      → Attendee Management
  ├─ /settings       → Settings
  └─ /admin          → Admin Panel (Protected: admin role only)
```

## Migration Guide

### Before (Old App.tsx)
```typescript
// State-based navigation
const [view, setView] = useState("landing");
setView("auth"); // No URL change
```

### After (New AppNew.tsx with Router)
```typescript
// URL-based navigation
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/auth'); // URL changes to /auth
```

### Before (Props drilling)
```typescript
// Pass user and callbacks through props
<Component user={user} onLogout={handleLogout} />
```

### After (Context API)
```typescript
// Use context hook
const { user, logout } = useAuth();
```

## Key Files Modified/Created

### Created Files:
- `src/app/contexts/AuthContext.tsx` - Authentication state management
- `src/app/components/ProtectedRoute.tsx` - Route protection
- `src/app/components/ErrorBoundary.tsx` - Error handling
- `src/app/components/LoadingSpinner.tsx` - Loading states
- `src/app/layouts/OrganizerLayout.tsx` - Dashboard layout
- `src/app/pages/LandingPage.tsx` - Router-aware landing
- `src/app/pages/AuthPage.tsx` - Router-aware authentication
- `src/app/AppNew.tsx` - New router-based app

### Modified Files:
- `src/app/api/client.ts` - Added token injection
- `src/app/components/CreateEvent.tsx` - Uses useNavigate
- `src/app/components/EventList.tsx` - Uses useNavigate, fetches data
- `src/app/components/Dashboard.tsx` - Fetches own data
- `src/app/components/AttendeeDashboard.tsx` - Uses useAuth
- `src/main.tsx` - Points to AppNew
- `package.json` - Added react-router-dom

## Usage Examples

### 1. Authentication
```typescript
// In any component
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome {user?.name}</div>;
}
```

### 2. Navigation
```typescript
// In any component
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/dashboard');
  };
  
  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### 3. Protected Routes
```typescript
// In routing configuration
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole={['admin', 'organizer']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

### 4. API Requests (Automatic Auth)
```typescript
// Token is automatically injected
const events = await eventApi.list();
// Request includes: Authorization: Bearer <token>
```

## Benefits Summary

### For Developers:
✅ Cleaner code organization with proper separation of concerns
✅ Type-safe routing and navigation
✅ Centralized auth and error handling
✅ Better debugging with error boundaries
✅ Reusable components (Loading, Protected Routes)

### For Users:
✅ Persistent login sessions
✅ Working browser navigation (back/forward)
✅ Better loading feedback
✅ Graceful error recovery
✅ Faster perceived performance with skeletons
✅ Professional, polished experience

### For Product:
✅ Shareable URLs
✅ Better SEO potential
✅ Analytics-friendly routing
✅ Role-based access control
✅ Scalable architecture

## Testing the Changes

1. **Authentication Flow:**
   ```bash
   npm run dev
   # Navigate to http://localhost:5173
   # Register a new account → Should redirect to dashboard
   # Refresh page → Should stay logged in
   # Logout → Should redirect to home
   ```

2. **Protected Routes:**
   ```bash
   # Try accessing /dashboard without login → Redirects to /auth
   # Login as attendee → Cannot access /dashboard/admin
   # Login as admin → Can access all routes
   ```

3. **Error Handling:**
   ```bash
   # Throw an error in a component
   # Should show error boundary instead of crashing
   ```

## Next Steps (Optional Enhancements)

1. **React Query** - Advanced data fetching and caching
2. **Form Validation** - Use react-hook-form + zod (already installed)
3. **API Error Handling** - Toast notifications for all errors
4. **Route Transitions** - Animated page transitions
5. **Progressive Web App** - Offline capabilities
6. **Performance** - Code splitting and lazy loading
7. **Testing** - Unit and integration tests

## Troubleshooting

**Issue:** "useAuth must be used within an AuthProvider"
**Solution:** Ensure component is wrapped in `<AuthProvider>` (already done in AppNew.tsx)

**Issue:** Token not included in requests
**Solution:** Check that AuthContext's useEffect is calling `setAuthToken(token)`

**Issue:** Redirects not working
**Solution:** Ensure component is inside `<BrowserRouter>` (already done in AppNew.tsx)

**Issue:** 404 on page refresh
**Solution:** Configure dev server for SPA routing (already configured in vite)

## Conclusion

These architectural improvements transform the frontend from a basic proof-of-concept into a production-ready application with:
- Professional routing and navigation
- Secure, persistent authentication
- Graceful error handling
- Excellent user experience

The changes maintain backward compatibility with the existing backend API while providing a solid foundation for future enhancements.
