import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Layouts
import AuthLayout from '../features/auth/AuthLayout';
import AppLayout from '../shared/components/AppLayout';

// Pages
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import AnalysisPage from '../features/analysis/AnalysisPage';
import MapPage from '../features/map/MapPage';
import AssistantPage from '../features/assistant/AssistantPage';
import LogbookPage from '../features/logbook/JournalPechePage';
import ProfilePage from '../features/profile/ProfilePage';
import CamPage from '../features/cam/CamPage';
import DataManagementPage from '../features/cam/DataManagementPage';
import AnnotationPage from '../features/cam/AnnotationPage';
import DatasetLibraryPage from '../features/cam/DatasetLibraryPage';

// Route protégée
function ProtectedRoute({ children, requiredPermissions = [] }) {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // TODO: Vérifier les permissions selon le rôle
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />

        {/* Routes protégées */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="logbook" element={<LogbookPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cam" element={<CamPage />} />
          <Route path="dataset-library" element={<DatasetLibraryPage />} />
          <Route path="data-management" element={<DataManagementPage />} />
          <Route path="annotation" element={<AnnotationPage />} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
