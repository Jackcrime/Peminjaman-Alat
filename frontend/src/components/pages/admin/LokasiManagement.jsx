import { useState, useEffect } from 'react';
import { lokasiService } from '../../../api/services';
import { MapPin, Plus, Edit, Trash2, X, AlertCircle, Package } from 'lucide-react';

const LokasiManagement = () => {
  const [lokasis, setLokasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLokasi, setSelectedLokasi] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ nama_ruangan: '', gedung: '', lantai: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await lokasiService.getAll();
      setLokasis(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error:', error);
      setError('Gagal memuat data');
      setLokasis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (lokasi = null) => {
    if (lokasi) {
      setEditMode(true);
      setSelectedLokasi(lokasi);
      setFormData({ 
        nama_ruangan: lokasi.nama_ruangan, 
        gedung: lokasi.gedung || '', 
        lantai: lokasi.lantai || '' 
      });
    } else {
      setEditMode(false);
      setFormData({ nama_ruangan: '', gedung: '', lantai: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await lokasiService.update(selectedLokasi.id, formData);
      } else {
        await lokasiService.create(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus lokasi ini?')) return;
    try {
      await lokasiService.delete(id);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal menghapus');
    }
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lokasi & Ruangan</h1>
              <p className="text-gray-500 mt-1">Kelola data lokasi penyimpanan alat</p>
            </div>
            <button 
              onClick={() => handleOpen()} 
              className="btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Tambah Lokasi
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

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Lokasi</p>
              <p className="text-2xl font-bold text-gray-900">{lokasis.length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-gray-700 font-semibold">Nama Ruangan</th>
                  <th className="text-gray-700 font-semibold">Gedung</th>
                  <th className="text-gray-700 font-semibold">Lantai</th>
                  <th className="text-gray-700 font-semibold">Jumlah Alat</th>
                  <th className="text-gray-700 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lokasis.length > 0 ? (
                  lokasis.map((lok) => (
                    <tr key={lok.id} className="hover:bg-gray-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{lok.nama_ruangan}</span>
                        </div>
                      </td>
                      <td className="text-gray-700">{lok.gedung || '-'}</td>
                      <td className="text-gray-700">{lok.lantai || '-'}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                          <Package className="w-3.5 h-3.5" />
                          {lok.alats_count || 0} alat
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpen(lok)} 
                            className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(lok.id)} 
                            className="btn btn-sm btn-ghost text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Tidak ada data lokasi</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="modal modal-open">
            <div className="modal-box bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-gray-900">
                  {editMode ? 'Edit Lokasi' : 'Tambah Lokasi'}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <X className="w-5 h-5 text-gray-900 hover:text-white" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Nama Ruangan *</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500" 
                    value={formData.nama_ruangan} 
                    onChange={(e) => setFormData({ ...formData, nama_ruangan: e.target.value })} 
                    required 
                    placeholder="Contoh: Lab Kimia 1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Gedung</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500" 
                      value={formData.gedung} 
                      onChange={(e) => setFormData({ ...formData, gedung: e.target.value })} 
                      placeholder="Contoh: Gedung A"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Lantai</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500" 
                      value={formData.lantai} 
                      onChange={(e) => setFormData({ ...formData, lantai: e.target.value })} 
                      placeholder="Contoh: 2"
                    />
                  </div>
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
                    className="btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                  >
                    Simpan
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

export default LokasiManagement;