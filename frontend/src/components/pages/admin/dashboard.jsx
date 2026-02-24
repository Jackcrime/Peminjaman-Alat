import { useState, useEffect } from 'react';
import { dashboardService, peminjamanService } from '../../../api/services';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Settings,
  UserCog,
  ClipboardList
} from 'lucide-react';

const dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPeminjaman, setRecentPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, peminjamanRes] = await Promise.all([
        dashboardService.getStats(),
        peminjamanService.getAll(), // ✅ FIXED: Remove params
      ]);
      
      setStats(statsRes.data || {
        total_alat: 0,
        total_peminjam: 0,
        pinjaman_aktif: 0,
        pending_approval: 0
      });
      setRecentPeminjaman(Array.isArray(peminjamanRes.data) ? peminjamanRes.data.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Gagal memuat data dashboard');
      setStats({
        total_alat: 0,
        total_peminjam: 0,
        pinjaman_aktif: 0,
        pending_approval: 0
      });
      setRecentPeminjaman([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      diajukan: { class: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Diajukan' },
      disetujui: { class: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Disetujui' },
      ditolak: { class: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Ditolak' },
      selesai: { class: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Selesai' },
    };
    return badges[status] || { class: 'bg-gray-100 text-gray-700 border-gray-200', label: status };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Selamat datang di panel admin Digitory</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error bg-rose-50 border-rose-200 text-rose-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Alat */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Alat</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_alat || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Seluruh alat terdaftar</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Peminjam */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Peminjam</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_peminjam || 0}</p>
                <p className="text-xs text-gray-400 mt-1">User terdaftar</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pinjaman Aktif */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pinjaman Aktif</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pinjaman_aktif || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Sedang dipinjam</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Pending Approval */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pending_approval || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Menunggu persetujuan</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Peminjaman Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Peminjaman Terbaru</h2>
              <Link 
                to="/admin/peminjaman" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-gray-700 font-semibold">Peminjam</th>
                  <th className="text-gray-700 font-semibold">Alat</th>
                  <th className="text-gray-700 font-semibold">Tanggal Pinjam</th>
                  <th className="text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPeminjaman.length > 0 ? (
                  recentPeminjaman.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                              <span className="text-sm font-semibold">
                                {item.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.user?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{item.user?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-gray-900">{item.alat?.nama_alat || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Jumlah: {item.jumlah || 0}</div>
                      </td>
                      <td className="text-gray-700">
                        {item.tgl_peminjaman ? new Date(item.tgl_peminjaman).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td>
                        {(() => {
                          const badge = getStatusBadge(item.status);
                          return (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Belum ada data peminjaman</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/alat" 
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Kelola Alat</h3>
                <p className="text-gray-500 text-sm mt-1">Tambah, edit, atau hapus data alat</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/admin/peminjaman" 
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Kelola Peminjaman</h3>
                <p className="text-gray-500 text-sm mt-1">Approve atau tolak permintaan pinjam</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/admin/users" 
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <UserCog className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Kelola User</h3>
                <p className="text-gray-500 text-sm mt-1">Manajemen user dan hak akses</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default dashboard;