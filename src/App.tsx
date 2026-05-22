import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './store/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { SalesListPage, SaleDetailPage } from './pages/SalesPage';
import NewSalePage from './pages/NewSalePage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import ConfigPage from './pages/ConfigPage';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/sales" element={<PrivateRoute><SalesListPage /></PrivateRoute>} />
      <Route path="/sales/new" element={<PrivateRoute><NewSalePage /></PrivateRoute>} />
      <Route path="/sales/:id" element={<PrivateRoute><SaleDetailPage /></PrivateRoute>} />
      <Route path="/clients" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
      <Route path="/config" element={<PrivateRoute adminOnly><ConfigPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(220, 22%, 13%)',
              color: 'hsl(45, 30%, 92%)',
              border: '1px solid hsl(220, 20%, 20%)',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: 'hsl(224,28%,7%)' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'hsl(224,28%,7%)' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
