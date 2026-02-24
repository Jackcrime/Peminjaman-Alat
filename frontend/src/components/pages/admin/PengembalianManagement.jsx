import { useState, useEffect } from 'react';
import { peminjamanService, pengembalianService } from '../../../api/services';
import { 
  RotateCcw, 
  Search,
  Calendar,
  Package,
  User,
  AlertCircle,
  CheckCircle,
  Check,
  X,
  Clock,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

const PengembalianManagement = () => {
  const [activePeminjaman, setActivePeminjaman] = useState([]); // Disetujui (belum dikembalikan)
  const [riwayat, setRiwayat] = useState([]); // Sudah dikembalikan
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  
  // Modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [returnData, setReturnData] = useState({
    tgl_pengembalian_aktual: new Date().toISOString().split('T')[0],
    kondisi_saat_dikembalikan: 'baik',
    catatan: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch semua peminjaman
      const peminjamanRes = await peminjamanService.getAll();
      const allPeminjaman = Array.isArray(peminjamanRes.data) ? peminjamanRes.data : [];
      
      // Fetch semua pengembalian
      const pengembalianRes = await pengembalianService.getAll();
      const allPengembalian = Array.isArray(pengembalianRes.data) ? pengembalianRes.data : [];
      
      // Filter: Hanya yang status 'disetujui' dan belum ada pengembalian
      const returnedIds = allPengembalian.map(p => p.peminjaman?.id).filter(Boolean);
      const active = allPeminjaman.filter(p => 
        p.status === 'disetujui' && !returnedIds.includes(p.id)
      );
      
      setActivePeminjaman(active);
      setRiwayat(allPengembalian);
    } catch (error) {
      console.error('Error:', error);
      setError('Gagal memuat data');
      setActivePeminjaman([]);
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (peminjaman) => {
    setSelectedPeminjaman(peminjaman);
    setReturnData({
      tgl_pengembalian_aktual: new Date().toISOString().split('T')[0],
      kondisi_saat_dikembalikan: 'baik',
      catatan: ''
    });
    setShowReturnModal(true);
  };

  const calculateDenda = () => {
    if (!selectedPeminjaman) return 0;
    
    const deadline = new Date(selectedPeminjaman.tgl_pengembalian);
    const actual = new Date(returnData.tgl_pengembalian_aktual);
    const diffTime = actual - deadline;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    
    // Progressive formula: Week 1 = 5k, Week 2 = 10k, ..., Max = 30k
    const weeksLate = Math.ceil(diffDays / 7);
    return Math.min(5000 + (weeksLate - 1) * 5000, 30000);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedPeminjaman) return;

    const denda = calculateDenda();

    try {
      await pengembalianService.create({
        peminjaman_id: selectedPeminjaman.id,
        tgl_pengembalian_aktual: returnData.tgl_pengembalian_aktual,
        kondisi_saat_dikembalikan: returnData.kondisi_saat_dikembalikan,
        denda: denda,
        catatan: returnData.catatan || (denda > 0 ? `Terlambat, denda Rp ${denda.toLocaleString('id-ID')}` : 'Tepat waktu')
      });

      alert(`✅ Pengembalian berhasil diproses!${denda > 0 ? `\n💰 Denda: Rp ${denda.toLocaleString('id-ID')}` : ''}`);
      setShowReturnModal(false);
      setSelectedPeminjaman(null);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Gagal memproses pengembalian: ' + (error.response?.data?.message || error.message));
    }
  };

  const isLate = (tgl_pengembalian) => {
    const deadline = new Date(tgl_pengembalian);
    const today = new Date();
    return today > deadline;
  };

  const getDaysLate = (tgl_pengembalian) => {
    const deadline = new Date(tgl_pengembalian);
    const today = new Date();
    const diffTime = today - deadline;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredActive = activePeminjaman.filter((item) =>
    item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alat?.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRiwayat = riwayat.filter((item) =>
    item.peminjaman?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.peminjaman?.alat?.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="loading loading-spinner loading-lg text-purple-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <RotateCcw className="w-8 h-8 text-purple-600" />
              Pengembalian Alat
            </h1>
            <p className="text-gray-500 mt-1">Proses pengembalian alat yang dipinjam</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error bg-rose-50 border-rose-200 text-rose-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-gray-900">{activePeminjaman.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Terlambat</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activePeminjaman.filter(p => isLate(p.tgl_pengembalian)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Riwayat</p>
                <p className="text-2xl font-bold text-gray-900">{riwayat.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                <span>Perlu Dikembalikan ({filteredActive.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Riwayat ({filteredRiwayat.length})</span>
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama peminjam atau alat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'active' ? (
              // ✅ TAB ACTIVE: Show peminjaman yang perlu dikembalikan
              filteredActive.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Tidak ada peminjaman yang perlu dikembalikan</p>
                  <p className="text-gray-400 text-sm mt-1">Semua alat sudah dikembalikan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Peminjam</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Alat</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tgl Pinjam</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deadline</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActive.map((item) => {
                        const late = isLate(item.tgl_pengembalian);
                        const daysLate = getDaysLate(item.tgl_pengembalian);
                        
                        return (
                          <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${late ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{item.user?.name || '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{item.alat?.nama_alat || '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-900">{item.jumlah}</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">
                              {new Date(item.tgl_peminjaman).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <div className={late ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                  {new Date(item.tgl_pengembalian).toLocaleDateString('id-ID')}
                                </div>
                                {late && (
                                  <div className="text-xs text-red-500 mt-1">
                                    Terlambat {daysLate} hari
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {late ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                  <AlertCircle className="w-3 h-3" />
                                  TERLAMBAT
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3" />
                                  AKTIF
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleOpenReturnModal(item)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Proses Kembali
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // ✅ TAB HISTORY: Show riwayat pengembalian
              filteredRiwayat.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Belum ada riwayat pengembalian</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Peminjam</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Alat</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tgl Kembali</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kondisi</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Denda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRiwayat.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.peminjaman?.user?.name || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {item.peminjaman?.alat?.nama_alat || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {new Date(item.tgl_pengembalian_aktual).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.kondisi_saat_dikembalikan === 'baik'
                                ? 'bg-green-100 text-green-700'
                                : item.kondisi_saat_dikembalikan === 'rusak'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.kondisi_saat_dikembalikan || item.status || 'baik'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {item.denda > 0 ? (
                              <span className="text-red-600 font-semibold">
                                Rp {item.denda.toLocaleString('id-ID')}
                              </span>
                            ) : (
                              <span className="text-green-600">Rp 0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedPeminjaman && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <RotateCcw className="w-6 h-6 text-purple-600" />
                  Proses Pengembalian
                </h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitReturn} className="p-6 space-y-4">
              {/* Info Peminjaman */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Peminjam:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedPeminjaman.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Alat:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedPeminjaman.alat?.nama_alat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Jumlah:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedPeminjaman.jumlah}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deadline:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(selectedPeminjaman.tgl_pengembalian).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Denda Info */}
              {calculateDenda() > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    TERLAMBAT
                  </div>
                  <div className="text-red-900 text-2xl font-bold">
                    Denda: Rp {calculateDenda().toLocaleString('id-ID')}
                  </div>
                </div>
              )}

              {/* Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Dikembalikan
                </label>
                <input
                  type="date"
                  value={returnData.tgl_pengembalian_aktual}
                  onChange={(e) => setReturnData({...returnData, tgl_pengembalian_aktual: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kondisi Alat
                </label>
                <select
                  value={returnData.kondisi_saat_dikembalikan}
                  onChange={(e) => setReturnData({...returnData, kondisi_saat_dikembalikan: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="baik"><Check className="w-5 h-5" /> Baik (Tidak Ada Kerusakan)</option>
                  <option value="rusak"><AlertTriangle className="w-5 h-5" /> Rusak (Ada Kerusakan)</option>
                  <option value="hilang"><X className="w-5 h-5" /> Hilang (Tidak Dikembalikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={returnData.catatan}
                  onChange={(e) => setReturnData({...returnData, catatan: e.target.value})}
                  className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Catatan tambahan tentang kondisi alat..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Check className="w-5 h-5" />
                  <span>Konfirmasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengembalianManagement;