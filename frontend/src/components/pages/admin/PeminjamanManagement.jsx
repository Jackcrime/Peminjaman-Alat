import { useState, useEffect } from 'react';
import { peminjamanService } from '../../../api/services';
import { 
  ClipboardList, 
  Search, 
  Filter,
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';

const PeminjamanManagement = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await peminjamanService.getAll();
      setPeminjaman(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data');
      setPeminjaman([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const confirmText = status === 'disetujui' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Yakin ingin ${confirmText} peminjaman ini?`)) return;

    try {
      await peminjamanService.updateStatus(id, status);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      diajukan: {
        class: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
        label: 'Diajukan'
      },
      disetujui: {
        class: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        label: 'Disetujui'
      },
      ditolak: {
        class: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: XCircle,
        label: 'Ditolak'
      },
      selesai: {
        class: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: CheckCircle,
        label: 'Selesai'
      },
    };
    return badges[status] || badges.diajukan;
  };

  const filteredData = peminjaman.filter((item) => {
    const matchFilter = !filter || item.status === filter;
    const matchSearch =
      item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alat?.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: peminjaman.length,
    diajukan: peminjaman.filter(p => p.status === 'diajukan').length,
    disetujui: peminjaman.filter(p => p.status === 'disetujui').length,
    ditolak: peminjaman.filter(p => p.status === 'ditolak').length,
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Peminjaman</h1>
            <p className="text-gray-500 mt-1">Kelola permintaan peminjaman alat</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error bg-rose-50 border-rose-200 text-rose-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.diajukan}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disetujui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.disetujui}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ditolak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari peminjam atau alat..."
                className="input input-bordered w-full pl-10 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                className="select select-bordered w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="diajukan">Diajukan</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-gray-700 font-semibold">Peminjam</th>
                  <th className="text-gray-700 font-semibold">Alat</th>
                  <th className="text-gray-700 font-semibold">Jumlah</th>
                  <th className="text-gray-700 font-semibold">Tanggal</th>
                  <th className="text-gray-700 font-semibold">Status</th>
                  <th className="text-gray-700 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const badge = getStatusBadge(item.status);
                    const BadgeIcon = badge.icon;
                    return (
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
                              <div className="text-sm text-gray-500">{item.user?.kelas || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">{item.alat?.nama_alat || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            {item.jumlah || 0} unit
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            {item.tgl_peminjaman ? new Date(item.tgl_peminjaman).toLocaleDateString('id-ID') : '-'}
                          </div>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          {item.status === 'diajukan' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'disetujui')}
                                className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Setuju
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'ditolak')}
                                className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none"
                              >
                                <XCircle className="w-4 h-4" />
                                Tolak
                              </button>
                            </div>
                          )}
                          {item.status !== 'diajukan' && (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Tidak ada data peminjaman</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeminjamanManagement;