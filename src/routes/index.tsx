/**
 * React Router configuration with protected routes.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/user'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProjectBoardPage } from '@/pages/ProjectBoardPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { MyTasksPage } from '@/pages/MyTasksPage'
import { UserManagementPage } from '@/pages/UserManagementPage'
import { AuditLogPage } from '@/pages/AuditLogPage'
import { Layout } from '@/components/layout/Layout'

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

// Admin-only route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{children}</Layout>
}

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectBoardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute>
              <MyTasksPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <AdminRoute>
              <AuditLogPage />
            </AdminRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
