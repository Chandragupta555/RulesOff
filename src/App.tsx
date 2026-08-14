import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { SplashScreen } from './screens/SplashScreen';
import { VerificationGateScreen } from './screens/VerificationGateScreen';
import { HostelSetupScreen } from './screens/HostelSetupScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { RoomListScreen } from './screens/RoomListScreen';

// Protected Route Guard for Setup
const RequireVerification: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  if (!user.isVerified) {
    return <Navigate to="/verify" replace />;
  }
  return <>{children}</>;
};

// Protected Route Guard for Catalog
const RequireSetupComplete: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
};

export default App;
