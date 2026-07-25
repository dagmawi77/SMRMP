import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PrivateRoute from './components/layout/PrivateRoute';
import useSessionRestore from './hooks/useSessionRestore';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ArtifactsPage from './pages/artifacts/ArtifactsPage';
import AddArtifactPage from './pages/artifacts/AddArtifactPage';
import ArtifactDetailPage from './pages/artifacts/ArtifactDetailPage';
import PublicArtifactPage from './pages/visitor/PublicArtifactPage';
import TicketPurchasePage from './pages/tickets/TicketPurchasePage';
import VisitorRegistrationPage from './pages/visitor/VisitorRegistrationPage';

export default function App() {
  useSessionRestore();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/artifact/:code" element={<PublicArtifactPage />} />
          <Route path="/tickets" element={<TicketPurchasePage />} />
          <Route path="/register" element={<VisitorRegistrationPage />} />

          {/* Protected staff routes */}
          <Route
            path="/dashboard"
            element={(
              <PrivateRoute roles={['admin', 'curator', 'conservation', 'maintenance']}>
                <DashboardPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/artifacts"
            element={(
              <PrivateRoute roles={['admin', 'curator', 'conservation', 'researcher']}>
                <ArtifactsPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/artifacts/new"
            element={(
              <PrivateRoute roles={['admin', 'curator']}>
                <AddArtifactPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/artifacts/:id"
            element={(
              <PrivateRoute roles={['admin', 'curator', 'conservation', 'researcher']}>
                <ArtifactDetailPage />
              </PrivateRoute>
            )}
          />

          {/* Legacy redirect */}
          <Route path="/public/artifacts/:id" element={<Navigate to="/artifacts" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
