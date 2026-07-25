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
import EditArtifactPage from './pages/artifacts/EditArtifactPage';
import PublicArtifactPage from './pages/visitor/PublicArtifactPage';
import TicketPurchasePage from './pages/tickets/TicketPurchasePage';
import TicketVerificationPage from './pages/tickets/TicketVerificationPage';
import TicketManagementPage from './pages/tickets/TicketManagementPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import VisitorRegistrationPage from './pages/visitor/VisitorRegistrationPage';
import ExhibitionDashboardPage from './pages/exhibitions/ExhibitionDashboardPage';
import UsersPage from './pages/users/UsersPage';

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
          <Route path="/tickets/buy" element={<TicketPurchasePage />} />
          <Route path="/tickets/verify" element={<TicketVerificationPage />} />
          <Route path="/tickets/verify/:code" element={<TicketVerificationPage />} />
          <Route path="/register" element={<VisitorRegistrationPage />} />

          {/* Protected staff routes */}
          <Route
            path="/tickets"
            element={(
              <PrivateRoute roles={['curator']}>
                <TicketManagementPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/tickets/:id"
            element={(
              <PrivateRoute roles={['curator']}>
                <TicketDetailPage />
              </PrivateRoute>
            )}
          />
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
            path="/exhibitions/*"
            element={(
              <PrivateRoute roles={['curator']}>
                <ExhibitionDashboardPage />
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
          <Route
            path="/artifacts/:id/edit"
            element={(
              <PrivateRoute roles={['admin', 'curator']}>
                <EditArtifactPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/users"
            element={(
              <PrivateRoute roles={['admin']}>
                <UsersPage />
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
