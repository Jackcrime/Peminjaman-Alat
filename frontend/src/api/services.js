import axiosClient from './axiosClient';

/*
|--------------------------------------------------------------------------
| API Services - InvenTrack (FINAL VERSION)
|--------------------------------------------------------------------------
| Services yang SYNC dengan backend api-FINAL.php
| Semua endpoint sudah disesuaikan dengan routes yang ada di backend
*/

// ==================== DASHBOARD ====================
export const dashboardService = {
  getStats: () => axiosClient.get('/dashboard'),
};

// ==================== ALAT ====================
export const alatService = {
  getAll: () => axiosClient.get('/alats'),
  getById: (id) => axiosClient.get(`/alats/${id}`),
  create: (data) => axiosClient.post('/alats', data),
  update: (id, data) => axiosClient.put(`/alats/${id}`, data),
  delete: (id) => axiosClient.delete(`/alats/${id}`),
  getKatalog: () => axiosClient.get('/katalog-alat'), // Untuk user
};

// ==================== KATEGORI ====================
export const kategoriService = {
  getAll: () => axiosClient.get('/kategoris'),
  getById: (id) => axiosClient.get(`/kategoris/${id}`),
  create: (data) => axiosClient.post('/kategoris', data),
  update: (id, data) => axiosClient.put(`/kategoris/${id}`, data),
  delete: (id) => axiosClient.delete(`/kategoris/${id}`),
};

// ==================== LOKASI ====================
export const lokasiService = {
  getAll: () => axiosClient.get('/lokasis'),
  getById: (id) => axiosClient.get(`/lokasis/${id}`),
  create: (data) => axiosClient.post('/lokasis', data),
  update: (id, data) => axiosClient.put(`/lokasis/${id}`, data),
  delete: (id) => axiosClient.delete(`/lokasis/${id}`),
};

// ==================== USERS ====================
export const userService = {
  getAll: () => axiosClient.get('/users'),
  getById: (id) => axiosClient.get(`/users/${id}`),
  create: (data) => axiosClient.post('/users', data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/users/${id}`),
};

// ==================== PEMINJAMAN (FIXED!) ====================
export const peminjamanService = {
  // GET /peminjaman - Role-based filtering di backend
  // User: hanya lihat punya sendiri
  // Admin/Staff: lihat semua
  getHistory: () => axiosClient.get('/peminjaman'), // ✅ FIXED: /peminjaman/history → /peminjaman
  getAll: (params) => axiosClient.get('/peminjaman', { params }), // ✅ FIXED: /peminjaman/all → /peminjaman
  
  // POST /peminjaman - Ajukan peminjaman (dari KatalogAlat)
  ajukan: (data) => axiosClient.post('/peminjaman', data), // ✅ FIXED: Now works!
  
  // GET /peminjaman/{id} - Detail peminjaman
  getById: (id) => axiosClient.get(`/peminjaman/${id}`),
  
  // PUT /peminjaman/{id}/status - Approve/Reject
  updateStatus: (id, status) => axiosClient.put(`/peminjaman/${id}/status`, { status }),
  
  // DELETE /peminjaman/{id}
  delete: (id) => axiosClient.delete(`/peminjaman/${id}`),
};

// ==================== PENGEMBALIAN ====================
export const pengembalianService = {
  getAll: () => axiosClient.get('/pengembalian'),
  getById: (id) => axiosClient.get(`/pengembalian/${id}`),
  create: (data) => axiosClient.post('/pengembalian', data),
  delete: (id) => axiosClient.delete(`/pengembalian/${id}`),
};

// ==================== LOG AKTIFITAS ====================
export const logService = {
  getAll: () => axiosClient.get('/logs'), // Admin & Staff only
  delete: (id) => axiosClient.delete(`/logs/${id}`),
};

/*
|--------------------------------------------------------------------------
| Change Log
|--------------------------------------------------------------------------
| 
| FIXED Endpoints:
| 1. peminjamanService.getHistory: /peminjaman/history → /peminjaman ✅
| 2. peminjamanService.getAll: /peminjaman/all → /peminjaman ✅
| 3. peminjamanService.ajukan: Already correct (/peminjaman) ✅
| 
| All endpoints now SYNC with backend api-FINAL.php
|--------------------------------------------------------------------------
*/