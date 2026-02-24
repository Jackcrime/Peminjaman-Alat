import { useState, useEffect } from 'react';
import { alatService, peminjamanService } from '../../../api/services';
import { 
  Package, 
  Search, 
  Filter,
  ShoppingCart,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Hash,
  Info
} from 'lucide-react';

const KatalogAlat = () => {
  const [alats, setAlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlat, setSelectedAlat] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    jumlah: 1,
    tgl_peminjaman: '',
    tgl_pengembalian: '',
    catatan: '',
  });

  useEffect(() => {
    fetchAlats();
  }, []);

  const fetchAlats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await alatService.getKatalog();
      setAlats(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching alats:', error);
      setError('Gagal memuat katalog');
      setAlats([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePinjam = (alat) => {
    setSelectedAlat(alat);
    setFormData({
      jumlah: 1,
      tgl_peminjaman: '',
      tgl_pengembalian: '',
      catatan: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.jumlah > selectedAlat.stok) {
      setError(`Stok tidak mencukupi! Hanya tersedia ${selectedAlat.stok} unit`);
      return;
    }

    try {
      const payload = {
        alat_id: selectedAlat.id,
        ...formData,
      };
      
      await peminjamanService.ajukan(payload);
      setSuccess('Pengajuan peminjaman berhasil! Tunggu approval dari staff.');
      setModalOpen(false);
      fetchAlats();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Gagal mengajukan peminjaman');
    }
  };

  const getKondisiBadge = (kondisi) => {
    const badges = {
      baik: { 
        class: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
        label: 'Baik'
      },
      rusak_ringan: { 
        class: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: AlertCircle,
        label: 'Rusak Ringan'
      },
      rusak_berat: { 
        class: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: X,
        label: 'Rusak Berat'
      },
      hancur: { 
        class: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: X,
        label: 'Hancur'
      },
    };
    return badges[kondisi] || badges.baik;
  };

  // Get unique categories
  const categories = [...new Set(alats.map(a => a.kategori?.nama_kategori).filter(Boolean))];

  // Filter
  const filteredAlats = alats.filter((alat) => {
    const matchSearch = 
      alat.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alat.kode_alat?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = !selectedKategori || alat.kategori?.nama_kategori === selectedKategori;
    return matchSearch && matchKategori;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
          <p className="text-gray-600">Memuat katalog...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Katalog Alat</h1>
            <p className="text-gray-500 mt-1">Lihat dan ajukan peminjaman alat</p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success bg-emerald-50 border-emerald-200 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="btn btn-sm btn-ghost">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error bg-rose-50 border-rose-200 text-rose-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari alat berdasarkan nama atau kode..."
                className="input input-bordered text-gray-900 w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                className="select select-bordered text-gray-900 w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map((kat, idx) => (
                  <option key={idx} value={kat}>{kat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlats.length > 0 ? (
            filteredAlats.map((alat) => {
              const badge = getKondisiBadge(alat.kondisi);
              const BadgeIcon = badge.icon;
              const isAvailable = alat.stok > 0 && alat.kondisi === 'baik';
              
              return (
                <div 
                  key={alat.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{alat.nama_alat}</h3>
                          <p className="text-sm text-gray-500 font-mono">{alat.kode_alat}</p>
                        </div>
                      </div>
                    </div>

                    {alat.deskripsi && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{alat.deskripsi}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Kategori</span>
                        <span className="font-medium text-gray-900">{alat.kategori?.nama_kategori || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Lokasi</span>
                        <span className="font-medium text-gray-900">{alat.lokasi?.nama_ruangan || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Stok</span>
                        <span className={`font-bold ${alat.stok > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {alat.stok} unit
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Kondisi</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePinjam(alat)}
                      disabled={!isAvailable}
                      className={`btn w-full ${
                        isAvailable 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      } border-none`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isAvailable ? 'Ajukan Pinjam' : 'Tidak Tersedia'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Tidak ada alat yang ditemukan</p>
            </div>
          )}
        </div>

        {/* Modal Pinjam */}
        {modalOpen && selectedAlat && (
          <div className="modal modal-open">
            <div className="modal-box bg-white max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-gray-900">Ajukan Peminjaman</h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <X className="w-5 h-5 text-gray-900 hover:text-white" />
                </button>
              </div>

              {/* Alat Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-gray-900">{selectedAlat.nama_alat}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{selectedAlat.kode_alat}</span>
                  </div>
                  <div className="text-gray-600">
                    Stok: <span className="font-bold text-emerald-600">{selectedAlat.stok} unit</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Jumlah *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) })}
                    min="1"
                    max={selectedAlat.stok}
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">Maksimal {selectedAlat.stok} unit</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Tanggal Pinjam *</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    value={formData.tgl_peminjaman}
                    onChange={(e) => setFormData({ ...formData, tgl_peminjaman: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Tanggal Kembali *</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    value={formData.tgl_pengembalian}
                    onChange={(e) => setFormData({ ...formData, tgl_pengembalian: e.target.value })}
                    min={formData.tgl_peminjaman}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Catatan</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    rows="3"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Keperluan peminjaman (opsional)"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)} 
                    className="btn btn-ghost"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn bg-blue-600 hover:bg-blue-700 text-white border-none"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Ajukan Peminjaman
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KatalogAlat;