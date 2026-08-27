import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { SplashScreen } from './screens/SplashScreen';
import { VerificationGateScreen } from './screens/VerificationGateScreen';
import { HostelSetupScreen } from './screens/HostelSetupScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { RoomListScreen } from './screens/RoomListScreen';
import { RequestConfirmationScreen } from './screens/RequestConfirmationScreen';
import { RequestsScreen } from './screens/RequestsScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminScreen } from './screens/AdminScreen';

// Protected Route Guard for Setup
const RequireVerification: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <div className="bg-[#050505] h-screen w-screen flex items-center justify-center text-primary-container">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
    );
  }
  if (!user.isVerified) {
    return <Navigate to="/verify" replace />;
  }
  return <>{children}</>;
};

// Protected Route Guard for Catalog
const RequireSetupComplete: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <div className="bg-[#050505] h-screen w-screen flex items-center justify-center text-primary-container">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
    );
  }
  if (!user.isVerified) {
    return <Navigate to="/verify" replace />;
  }
  if (!user.hasCompletedSetup) {
    return <Navigate to="/setup" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/verify" element={<VerificationGateScreen />} />
      <Route
        path="/setup"
        element={
          <RequireVerification>
            <HostelSetupScreen />
          </RequireVerification>
        }
      />
      <Route
        path="/catalog"
        element={
          <RequireSetupComplete>
            <CatalogScreen />
          </RequireSetupComplete>
        }
      />
      <Route
        path="/catalog/:productId"
        element={
          <RequireSetupComplete>
            <RoomListScreen />
          </RequireSetupComplete>
        }
      />
      <Route
        path="/request-confirm/:listingId"
        element={
          <RequireSetupComplete>
            <RequestConfirmationScreen />
          </RequireSetupComplete>
        }
      />
      <Route
        path="/requests"
        element={
          <RequireSetupComplete>
            <RequestsScreen />
          </RequireSetupComplete>
        }
      />
      <Route
        path="/rank"
        element={
          <RequireSetupComplete>
            <LeaderboardScreen />
          </RequireSetupComplete>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireSetupComplete>
            <ProfileScreen />
          </RequireSetupComplete>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireSetupComplete>
            <AdminScreen />
          </RequireSetupComplete>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}
