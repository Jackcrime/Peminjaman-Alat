import { useState, useEffect } from 'react';
import { kategoriService } from '../../../api/services';
import { FolderTree, Plus, Edit, Trash2, X, AlertCircle, Package } from 'lucide-react';

const KategoriManagement = () => {
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ nama_kategori: '', deskripsi: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await kategoriService.getAll();
      setKategoris(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error:', error);
      setError('Gagal memuat data');
      setKategoris([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (kategori = null) => {
    if (kategori) {
      setEditMode(true);
      setSelectedKategori(kategori);
      setFormData({ nama_kategori: kategori.nama_kategori, deskripsi: kategori.deskripsi || '' });
    } else {
      setEditMode(false);
      setFormData({ nama_kategori: '', deskripsi: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await kategoriService.update(selectedKategori.id, formData);
      } else {
        await kategoriService.create(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus kategori ini?')) return;
    try {
      await kategoriService.delete(id);
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
              <h1 className="text-3xl font-bold text-gray-900">Kategori Alat</h1>
              <p className="text-gray-500 mt-1">Kelola kategori alat laboratorium</p>
            </div>
            <button 
              onClick={() => handleOpen()} 
              className="btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Tambah Kategori
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
            <div className="bg-blue-100 p-3 rounded-lg">
              <FolderTree className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Kategori</p>
              <p className="text-2xl font-bold text-gray-900">{kategoris.length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-gray-700 font-semibold">Nama Kategori</th>
                  <th className="text-gray-700 font-semibold">Deskripsi</th>
                  <th className="text-gray-700 font-semibold">Jumlah Alat</th>
                  <th className="text-gray-700 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kategoris.length > 0 ? (
                  kategoris.map((kat) => (
                    <tr key={kat.id} className="hover:bg-gray-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FolderTree className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{kat.nama_kategori}</span>
                        </div>
                      </td>
                      <td className="text-gray-700">{kat.deskripsi || '-'}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          <Package className="w-3.5 h-3.5" />
                          {kat.alats_count || 0} alat
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpen(kat)} 
                            className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(kat.id)} 
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
                    <td colSpan="4" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FolderTree className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Tidak ada data kategori</p>
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
                  {editMode ? 'Edit Kategori' : 'Tambah Kategori'}
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
                    <span className="label-text font-medium text-gray-700">Nama Kategori *</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500" 
                    value={formData.nama_kategori} 
                    onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Deskripsi</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500" 
                    value={formData.deskripsi} 
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} 
                    rows="3"
                    placeholder="Deskripsi kategori (opsional)"
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

export default KategoriManagement;