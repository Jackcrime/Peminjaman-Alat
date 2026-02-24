import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './api/auth';

// Auth Pages
import Login from './components/pages/auth/login';
import Register from './components/pages/auth/register';

// Shared Components
import Layout from './components/fragments/Layout';
import ProtectedRoute from './components/fragments/ProtectedRoute';

// Admin Pages
import AdminDashboard from './components/pages/admin/dashboard';
import AlatManagement from './components/pages/admin/AlatManagement';
import KategoriManagement from './components/pages/admin/KategoriManagement';
import LokasiManagement from './components/pages/admin/LokasiManagement';
import UserManagement from './components/pages/admin/UserManagement';
import PeminjamanManagement from './components/pages/admin/PeminjamanManagement';
import PengembalianManagement from './components/pages/admin/PengembalianManagement';

// Staff Pages
import StaffDashboard from './components/pages/staff/dashboard';
import StaffPeminjaman from './components/pages/staff/Peminjaman';
import StaffPengembalian from './components/pages/staff/Pengembalian';

// User Pages
import UserDashboard from './components/pages/user/dashboard';
import KatalogAlat from './components/pages/user/KatalogAlat';
import RiwayatPeminjaman from './components/pages/user/RiwayatPeminjaman';

function App() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Redirect berdasarkan role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'staff') return '/staff/dashboard';
    return '/user/dashboard';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Register />} 
        />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="alat" element={<AlatManagement />} />
          <Route path="kategori" element={<KategoriManagement />} />
          <Route path="lokasi" element={<LokasiManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="peminjaman" element={<PeminjamanManagement />} />
          <Route path="pengembalian" element={<PengembalianManagement />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="peminjaman" element={<StaffPeminjaman />} />
          <Route path="pengembalian" element={<StaffPengembalian />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="katalog" element={<KatalogAlat />} />
          <Route path="riwayat" element={<RiwayatPeminjaman />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;