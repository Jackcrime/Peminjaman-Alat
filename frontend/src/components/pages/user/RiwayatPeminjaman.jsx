import { useState, useEffect } from 'react';
import { peminjamanService } from '../../../api/services';
import { 
  History, 
  Search,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';


const RiwayatPeminjaman = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await peminjamanService.getHistory();
      setRiwayat(Array.isArray(response.data) ? response.data : []);
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
    return badges[status] || badges.diajukan;
  };

  const filteredData = riwayat.filter((item) =>
    item.alat?.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alat?.kode_alat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-gray-600">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Riwayat Peminjaman</h1>
              <p className="text-gray-500 mt-1">Lihat semua riwayat peminjaman Anda</p>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Peminjaman</p>
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
                <p className="text-sm text-gray-500">Menunggu Approval</p>
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
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama alat atau kode..."
              className="input input-bordered text-gray-900 w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-gray-700 font-semibold">Alat</th>
                  <th className="text-gray-700 font-semibold">Jumlah</th>
                  <th className="text-gray-700 font-semibold">Tanggal Pinjam</th>
                  <th className="text-gray-700 font-semibold">Tanggal Kembali</th>
                  <th className="text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
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
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            {item.tgl_pengembalian ? new Date(item.tgl_pengembalian).toLocaleDateString('id-ID') : '-'}
                          </div>
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
                    <td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <History className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Belum ada riwayat peminjaman</p>
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

export default RiwayatPeminjaman;