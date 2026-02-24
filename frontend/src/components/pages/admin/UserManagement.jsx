import { useState, useEffect } from 'react';
import { userService } from '../../../api/services';
import authService from '../../../api/auth';
import { Users, Search, Shield, UserCog, User as UserIcon, AlertCircle, Calendar, Edit, X } from 'lucide-react';

const UserManagement = () => {
  const currentUser = authService.getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    kelas: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.getAll();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error:', error);
      setError('Gagal memuat data');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      kelas: user.kelas || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.update(selectedUser.id, formData);
      setModalOpen(false);
      fetchData();
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal update user');
    }
  };

  const canEdit = (user) => {
    // Admin can edit all users except other admins
    if (currentUser?.role === 'admin') {
      return user.role !== 'admin';
    }
    return false;
  };

  const getRoleBadge = (role) => {
    const badges = { 
      admin: { 
        class: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Shield,
        label: 'Admin'
      },
      staff: { 
        class: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: UserCog,
        label: 'Staff'
      },
      user: { 
        class: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: UserIcon,
        label: 'User'
      }
    };
    return badges[role] || badges.user;
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.kelas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    user: users.filter(u => u.role === 'user').length,
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
            <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
            <p className="text-gray-500 mt-1">Kelola data user sistem</p>
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
              placeholder="Cari user berdasarkan nama, email, atau kelas..."
              className="input input-bordered w-full pl-10 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total User</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Admin</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admin}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCog className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.staff}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <UserIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Siswa</p>
                <p className="text-2xl font-bold text-gray-900">{stats.user}</p>
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
                  <th className="text-gray-700 font-semibold">User</th>
                  <th className="text-gray-700 font-semibold">Email</th>
                  <th className="text-gray-700 font-semibold">Role</th>
                  <th className="text-gray-700 font-semibold">Kelas</th>
                  <th className="text-gray-700 font-semibold">Bergabung</th>
                  <th className="text-gray-700 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-700">{user.email}</td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="text-gray-700">{user.kelas || '-'}</td>
                        <td>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                          </div>
                        </td>
                        <td>
                          {canEdit(user) ? (
                            <button
                              onClick={() => handleEdit(user)}
                              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">Tidak ada data user</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {modalOpen && selectedUser && (
          <div className="modal modal-open">
            <div className="modal-box bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-gray-900">Edit User</h3>
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
                    <span className="label-text font-medium text-gray-700">Nama Lengkap *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-gray-50 text-gray-900 border-gray-200 focus:bg-white focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Email *</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered bg-gray-50 text-gray-900 border-gray-200 focus:bg-white focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Role *</span>
                  </label>
                  <select
                    className="select select-bordered bg-gray-50 text-gray-900 border-gray-200 focus:bg-white focus:border-blue-500"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Kelas</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered text-gray-900 text-gray-900 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="Contoh: XII RPL 1"
                  />
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
                    Simpan Perubahan
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

export default UserManagement;