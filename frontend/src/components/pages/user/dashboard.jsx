import { useState, useEffect } from 'react';
import { peminjamanService } from '../../../api/services';
import { Link } from 'react-router-dom';
import authService from '../../../api/auth';
import { 
  BookOpen, 
  History, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowRight,
  Package
} from 'lucide-react';

const dashboard = () => {
  const user = authService.getCurrentUser();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await peminjamanService.getHistory();
      setRiwayat(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Gagal memuat riwayat peminjaman');
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      diajukan: { 
        class: 'bg-amber-100 text-amber-700 border-amber-200', 
        label: 'Diajukan',
        icon: Clock 
      },
      disetujui: { 
        class: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        label: 'Disetujui',
        icon: CheckCircle 
      },
      ditolak: { 
        class: 'bg-rose-100 text-rose-700 border-rose-200', 
        label: 'Ditolak',
        icon: XCircle 
      },
      selesai: { 
        class: 'bg-blue-100 text-blue-700 border-blue-200', 
        label: 'Selesai',
        icon: CheckCircle 
      },
    };
    return badges[status] || { 
      class: 'bg-gray-100 text-gray-700 border-gray-200', 
      label: status,
      icon: AlertCircle 
    };
  };

  const stats = {
    total: riwayat.length,
    diajukan: riwayat.filter(item => item.status === 'diajukan').length,
    disetujui: riwayat.filter(item => item.status === 'disetujui').length,
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
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat Datang, {user?.name}!
          </h1>
          <p className="text-gray-500 mt-1">Dashboard peminjaman alat laboratorium</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error bg-rose-50 border-rose-200 text-rose-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Peminjaman */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Peminjaman</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">Seluruh riwayat</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Menunggu Approval */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Menunggu Approval</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.diajukan}</p>
                <p className="text-xs text-gray-400 mt-1">Sedang diproses</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Disetujui */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Disetujui</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.disetujui}</p>
                <p className="text-xs text-gray-400 mt-1">Sedang dipinjam</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Terbaru */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Peminjaman Terbaru</h2>
              <Link 
                to="/user/riwayat" 
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
                  <th className="text-gray-700 font-semibold">Alat</th>
                  <th className="text-gray-700 font-semibold">Jumlah</th>
                  <th className="text-gray-700 font-semibold">Tanggal Pinjam</th>
                  <th className="text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.length > 0 ? (
                  riwayat.map((item) => {
                    const badge = getStatusBadge(item.status);
                    const StatusIcon = badge.icon;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{item.alat?.nama_alat || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{item.alat?.kategori?.nama_kategori || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-700 font-medium">{item.jumlah || 0} unit</td>
                        <td className="text-gray-700">
                          {item.tgl_peminjaman ? new Date(item.tgl_peminjaman).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <History className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Belum ada riwayat peminjaman</p>
                        <Link to="/user/katalog" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Mulai Pinjam Alat →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/user/katalog" 
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Katalog Alat</h3>
                <p className="text-gray-500 text-sm mt-1">Lihat dan pinjam alat yang tersedia</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/user/riwayat" 
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Riwayat Peminjaman</h3>
                <p className="text-gray-500 text-sm mt-1">Lihat semua riwayat peminjaman Anda</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default dashboard;