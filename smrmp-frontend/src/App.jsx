import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PrivateRoute from './components/layout/PrivateRoute';
import VisitorLayout from './components/layout/VisitorLayout';
import RedirectVisitorsToPortal from './components/layout/RedirectVisitorsToPortal';
import useSessionRestore from './hooks/useSessionRestore';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import SetPasswordPage from './pages/auth/SetPasswordPage';
import RoleDashboard from './pages/dashboard/RoleDashboard';
import AssignedTasksPage from './pages/maintenance/AssignedTasksPage';
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
import CreateExhibitionPage from './pages/exhibitions/CreateExhibitionPage';
import UsersPage from './pages/users/UsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import SettingsPage from './pages/settings/SettingsPage';
import VisitorsPage from './pages/visitors/VisitorsPage';
import VisitorDetailPage from './pages/visitors/VisitorDetailPage';
import VisitorAnalyticsPage from './pages/visitors/VisitorAnalyticsPage';
import MembershipsPage from './pages/memberships/MembershipsPage';
import IssueMembershipPage from './pages/memberships/IssueMembershipPage';
import MembershipVerifyPage from './pages/memberships/MembershipVerifyPage';
import MembershipCardPage from './pages/memberships/MembershipCardPage';
import GroupBookingsPage from './pages/bookings/GroupBookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import PublicGroupBookingPage from './pages/bookings/PublicGroupBookingPage';
import FeedbackFormPage from './pages/feedback/FeedbackFormPage';
import FeedbackDashboardPage from './pages/feedback/FeedbackDashboardPage';
import VisitorDashboardPage from './pages/portal/VisitorDashboardPage';
import PortalProfilePage from './pages/portal/PortalProfilePage';
import PortalMembershipPage from './pages/portal/PortalMembershipPage';
import PortalTicketsPage from './pages/portal/PortalTicketsPage';
import PortalTicketPassPage from './pages/portal/PortalTicketPassPage';
import PortalVisitsPage from './pages/portal/PortalVisitsPage';
import PortalBookingsPage from './pages/portal/PortalBookingsPage';

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
          <Route
            path="/tickets"
            element={(
              <RedirectVisitorsToPortal to="/portal/tickets/buy">
                <TicketPurchasePage />
              </RedirectVisitorsToPortal>
            )}
          />
          <Route path="/tickets/buy" element={<Navigate to="/tickets" replace />} />
          <Route path="/tickets/telebirr/paygate" element={<TelebirrPaygatePage />} />
          <Route path="/tickets/verify" element={<TicketVerificationPage />} />
          <Route path="/tickets/verify/:code" element={<TicketVerificationPage />} />
          <Route path="/register" element={<VisitorRegistrationPage />} />
          <Route
            path="/feedback"
            element={(
              <RedirectVisitorsToPortal to="/portal/feedback">
                <FeedbackFormPage />
              </RedirectVisitorsToPortal>
            )}
          />
          <Route
            path="/book-group-visit"
            element={(
              <RedirectVisitorsToPortal to="/portal/bookings/new">
                <PublicGroupBookingPage />
              </RedirectVisitorsToPortal>
            )}
          />
          <Route path="/membership/:id/card" element={<MembershipCardPage />} />

          <Route
            path="/change-password"
            element={(
              <PrivateRoute>
                <ChangePasswordPage />
              </PrivateRoute>
            )}
          />

          <Route
            path="/settings"
            element={(
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            )}
          />

          <Route
            path="/tickets/manage"
            element={(
              <PrivateRoute permissions="tickets.list" excludeRoles={['maintenance']}>
                <TicketManagementPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/tickets/manage/:id"
            element={(
              <PrivateRoute permissions="tickets.list" excludeRoles={['maintenance']}>
                <TicketDetailPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <PrivateRoute permissions="dashboard.read">
                <RoleDashboard />
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
            path="/exhibitions"
            element={(
              <PrivateRoute permissions="exhibitions.read">
                <ExhibitionDashboardPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/maintenance/tasks"
            element={(
              <PrivateRoute permissions="maintenance.read" roles={['maintenance']}>
                <AssignedTasksPage />
              </PrivateRoute>
            )}
          />
          <Route path="/maintenance/*" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/exhibitions/new"
            element={(
              <PrivateRoute permissions="exhibitions.read">
                <CreateExhibitionPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/exhibitions/:id/edit"
            element={(
              <PrivateRoute permissions="exhibitions.read">
                <CreateExhibitionPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/exhibitions/*"
            element={<Navigate to="/exhibitions" replace />}
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
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          <Route
            path="/admin/users"
            element={(
              <PrivateRoute permissions="users.read">
                <UsersPage />
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
          <Route path="/admin/settings" element={<Navigate to="/settings" replace />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />

          {/* Visitor Relations — Curator Portal only */}
          <Route
            path="/visitors/analytics"
            element={(
              <PrivateRoute roles={['curator']} permissions="visitors.read">
                <VisitorAnalyticsPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/visitors/:id"
            element={(
              <PrivateRoute roles={['curator']} permissions="visitors.read">
                <VisitorDetailPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/visitors"
            element={(
              <PrivateRoute roles={['curator']} permissions="visitors.read">
                <VisitorsPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/memberships/issue"
            element={(
              <PrivateRoute roles={['curator']} permissions="members.create">
                <IssueMembershipPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/memberships/verify/:code"
            element={(
              <PrivateRoute roles={['curator']} permissions="members.verify">
                <MembershipVerifyPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/memberships/verify"
            element={(
              <PrivateRoute roles={['curator']} permissions="members.verify">
                <MembershipVerifyPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/memberships"
            element={(
              <PrivateRoute roles={['curator']} permissions="members.read">
                <MembershipsPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/group-bookings/:id"
            element={(
              <PrivateRoute roles={['curator']} permissions="bookings.read">
                <BookingDetailPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/group-bookings"
            element={(
              <PrivateRoute roles={['curator']} permissions="bookings.read">
                <GroupBookingsPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/feedback/dashboard"
            element={(
              <PrivateRoute roles={['curator']} permissions="feedback.read">
                <FeedbackDashboardPage />
              </PrivateRoute>
            )}
          />

          {/* Visitor Portal — visitor role only */}
          <Route
            path="/portal"
            element={(
              <PrivateRoute roles={['visitor']} permissions="portal.read">
                <VisitorLayout />
              </PrivateRoute>
            )}
          >
            <Route index element={<VisitorDashboardPage />} />
            <Route
              path="profile"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.profile">
                  <PortalProfilePage />
                </PrivateRoute>
              )}
            />
            <Route
              path="membership"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.memberships">
                  <PortalMembershipPage />
                </PrivateRoute>
              )}
            />
            <Route
              path="tickets"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.tickets">
                  <PortalTicketsPage />
                </PrivateRoute>
              )}
            />
            <Route
              path="tickets/buy"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.tickets">
                  <TicketPurchasePage />
                </PrivateRoute>
              )}
            />
            <Route
              path="tickets/pass/:code"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.tickets">
                  <PortalTicketPassPage />
                </PrivateRoute>
              )}
            />
            <Route
              path="visits"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.visits">
                  <PortalVisitsPage />
                </PrivateRoute>
              )}
            />
            <Route
              path="bookings"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.bookings">
                  <PortalBookingsPage />
                </PrivateRoute>
              )}
            />
            <Route
              path="bookings/new"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.bookings">
                  <PublicGroupBookingPage />
                </PrivateRoute>
              )}
            />
            <Route
              path="feedback"
              element={(
                <PrivateRoute roles={['visitor']} permissions="portal.read">
                  <FeedbackFormPage />
                </PrivateRoute>
              )}
            />
            <Route
              path="change-password"
              element={<ChangePasswordPage />}
            />
          </Route>

          <Route path="/public/artifacts/:id" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
