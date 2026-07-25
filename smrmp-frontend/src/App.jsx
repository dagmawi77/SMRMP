import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PrivateRoute from './components/layout/PrivateRoute';
import useSessionRestore from './hooks/useSessionRestore';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import SetPasswordPage from './pages/auth/SetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ArtifactsPage from './pages/artifacts/ArtifactsPage';
import AddArtifactPage from './pages/artifacts/AddArtifactPage';
import ArtifactDetailPage from './pages/artifacts/ArtifactDetailPage';
import EditArtifactPage from './pages/artifacts/EditArtifactPage';
import PublicArtifactPage from './pages/visitor/PublicArtifactPage';
import TicketPurchasePage from './pages/tickets/TicketPurchasePage';
import TelebirrPaygatePage from './pages/tickets/TelebirrPaygatePage';
import TicketVerificationPage from './pages/tickets/TicketVerificationPage';
import TicketManagementPage from './pages/tickets/TicketManagementPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import VisitorRegistrationPage from './pages/visitor/VisitorRegistrationPage';
import ExhibitionDashboardPage from './pages/exhibitions/ExhibitionDashboardPage';
import AdminAccessPage from './pages/admin/AdminAccessPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage';

export default function App() {
  useSessionRestore();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/artifact/:code" element={<PublicArtifactPage />} />
          <Route path="/tickets" element={<TicketPurchasePage />} />
          <Route path="/tickets/buy" element={<Navigate to="/tickets" replace />} />
          <Route path="/tickets/telebirr/paygate" element={<TelebirrPaygatePage />} />
          <Route path="/tickets/verify" element={<TicketVerificationPage />} />
          <Route path="/tickets/verify/:code" element={<TicketVerificationPage />} />
          <Route path="/register" element={<VisitorRegistrationPage />} />

          <Route
            path="/change-password"
            element={(
              <PrivateRoute>
                <ChangePasswordPage />
              </PrivateRoute>
            )}
          />

          <Route
            path="/tickets/manage"
            element={(
              <PrivateRoute permissions="tickets.list">
                <TicketManagementPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/tickets/manage/:id"
            element={(
              <PrivateRoute permissions="tickets.list">
                <TicketDetailPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <PrivateRoute permissions="dashboard.read">
                <DashboardPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/artifacts"
            element={(
              <PrivateRoute permissions="artifacts.read">
                <ArtifactsPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/exhibitions/*"
            element={(
              <PrivateRoute permissions="exhibitions.read">
                <ExhibitionDashboardPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/artifacts/new"
            element={(
              <PrivateRoute permissions="artifacts.create">
                <AddArtifactPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/artifacts/:id"
            element={(
              <PrivateRoute permissions="artifacts.read">
                <ArtifactDetailPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/artifacts/:id/edit"
            element={(
              <PrivateRoute permissions="artifacts.update">
                <EditArtifactPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <PrivateRoute permissions={['users.read', 'roles.read']} anyPermission>
                <AdminAccessPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/admin/users"
            element={(
              <PrivateRoute permissions="users.read">
                <AdminUsersPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/admin/roles"
            element={(
              <PrivateRoute permissions="roles.read">
                <AdminRolesPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/admin/permissions"
            element={(
              <PrivateRoute permissions="roles.read">
                <AdminPermissionsPage />
              </PrivateRoute>
            )}
          />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />

          <Route path="/public/artifacts/:id" element={<Navigate to="/artifacts" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
