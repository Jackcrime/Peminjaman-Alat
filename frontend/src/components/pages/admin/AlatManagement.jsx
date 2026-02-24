import { useState, useEffect } from 'react';
import { alatService, kategoriService, lokasiService } from '../../../api/services';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const AlatManagement = () => {
  const [alats, setAlats] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [lokasis, setLokasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAlat, setSelectedAlat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nama_alat: '',
    kode_alat: '',
    stok: '',
    kategori_id: '',
    lokasi_id: '',
    kondisi: 'baik',
    deskripsi: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [alatsRes, kategorisRes, lokasisRes] = await Promise.all([
        alatService.getAll(),
        kategoriService.getAll(),
        lokasiService.getAll(),
      ]);
      setAlats(Array.isArray(alatsRes.data) ? alatsRes.data : []);
      setKategoris(Array.isArray(kategorisRes.data) ? kategorisRes.data : []);
      setLokasis(Array.isArray(lokasisRes.data) ? lokasisRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data');
      setAlats([]);
      setKategoris([]);
      setLokasis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (alat = null) => {
    if (alat) {
      setEditMode(true);
      setSelectedAlat(alat);
      setFormData({
        nama_alat: alat.nama_alat,
        kode_alat: alat.kode_alat,
        stok: alat.stok,
        kategori_id: alat.kategori_id,
        lokasi_id: alat.lokasi_id,
        kondisi: alat.kondisi,
        deskripsi: alat.deskripsi || '',
      });
    } else {
      setEditMode(false);
      setSelectedAlat(null);
      setFormData({
        nama_alat: '',
        kode_alat: '',
        stok: '',
        kategori_id: '',
        lokasi_id: '',
        kondisi: 'baik',
        deskripsi: '',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setSelectedAlat(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await alatService.update(selectedAlat.id, formData);
      } else {
        await alatService.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving alat:', error);
      setError(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus alat ini?')) return;
    
    try {
      await alatService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting alat:', error);
      setError('Gagal menghapus alat');
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
        icon: AlertTriangle,
        label: 'Rusak Ringan'
      },
      rusak_berat: { 
        class: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: AlertCircle,
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

  const filteredAlats = alats.filter((alat) =>
    alat.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alat.kode_alat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Alat</h1>
              <p className="text-gray-500 mt-1">Kelola data alat laboratorium</p>
            </div>
            <button 
              onClick={() => handleOpenModal()} 
              className="btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Tambah Alat
            </button>
          </div>
        </div>

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

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari alat berdasarkan nama atau kode..."
              className="input input-bordered w-full pl-10 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Alat</p>
                <p className="text-2xl font-bold text-gray-900">{alats.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kondisi Baik</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alats.filter(a => a.kondisi === 'baik').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Perlu Perbaikan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alats.filter(a => a.kondisi !== 'baik').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-gray-700 font-semibold">Kode</th>
                  <th className="text-gray-700 font-semibold">Nama Alat</th>
                  <th className="text-gray-700 font-semibold">Kategori</th>
                  <th className="text-gray-700 font-semibold">Lokasi</th>
                  <th className="text-gray-700 font-semibold">Stok</th>
                  <th className="text-gray-700 font-semibold">Kondisi</th>
                  <th className="text-gray-700 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlats.length > 0 ? (
                  filteredAlats.map((alat) => {
                    const badge = getKondisiBadge(alat.kondisi);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={alat.id} className="hover:bg-gray-50 transition-colors">
                        <td>
                          <div className="font-mono font-bold text-blue-600">{alat.kode_alat}</div>
                        </td>
                        <td>
                          <div className="font-semibold text-gray-900">{alat.nama_alat}</div>
                          {alat.deskripsi && (
                            <div className="text-sm text-gray-500 mt-1">{alat.deskripsi}</div>
                          )}
                        </td>
                        <td className="text-gray-700">{alat.kategori?.nama_kategori || '-'}</td>
                        <td className="text-gray-700">{alat.lokasi?.nama_ruangan || '-'}</td>
                        <td>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            {alat.stok} unit
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal(alat)}
                              className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(alat.id)}
                              className="btn btn-sm btn-ghost text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Tidak ada data alat</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {modalOpen && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-3xl bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-gray-900">
                  {editMode ? 'Edit Alat' : 'Tambah Alat Baru'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <X className="w-5 h-5 text-gray-900 hover:text-white" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Nama Alat *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      value={formData.nama_alat}
                      onChange={(e) => setFormData({ ...formData, nama_alat: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Kode Alat *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered font-mono text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      value={formData.kode_alat}
                      onChange={(e) => setFormData({ ...formData, kode_alat: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Stok *</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      value={formData.stok}
                      onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Kategori *</span>
                    </label>
                    <select
                      className="select select-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      value={formData.kategori_id}
                      onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoris.map((kat) => (
                        <option key={kat.id} value={kat.id}>
                          {kat.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Lokasi *</span>
                    </label>
                    <select
                      className="select select-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      value={formData.lokasi_id}
                      onChange={(e) => setFormData({ ...formData, lokasi_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Lokasi</option>
                      {lokasis.map((lok) => (
                        <option key={lok.id} value={lok.id}>
                          {lok.nama_ruangan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Kondisi *</span>
                    </label>
                    <select
                      className="select select-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                      value={formData.kondisi}
                      onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
                      required
                    >
                      <option value="baik">Baik</option>
                      <option value="rusak_ringan">Rusak Ringan</option>
                      <option value="rusak_berat">Rusak Berat</option>
                      <option value="hancur">Hancur</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Deskripsi</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    rows="3"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi alat (opsional)"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    className="btn btn-ghost"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                  >
                    {editMode ? 'Simpan Perubahan' : 'Tambah Alat'}
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

export default AlatManagement;