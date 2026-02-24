import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import authService from '../../api/auth';
import { logService } from '../../api/services';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FolderTree, 
  MapPin, 
  ClipboardList, 
  RotateCcw,
  BookOpen,
  History,
  X,
  Menu,
  Bell,
  LogOut,
  Activity,
  Clock
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logs, setLogs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs for click outside detection
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch logs untuk admin & staff
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'staff') {
      fetchLogs();
      // Refresh logs every 30 seconds
      const interval = setInterval(fetchLogs, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  // Handle click outside untuk close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await logService.getAll();
      const logData = Array.isArray(response.data) ? response.data : [];
      setLogs(logData.slice(0, 10)); // Ambil 10 terbaru
      
      // Hitung unread (log dalam 1 jam terakhir)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogs = logData.filter(log => new Date(log.created_at) > oneHourAgo);
      setUnreadCount(recentLogs.length);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setUnreadCount(0);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      navigate('/login');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { class: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Admin' },
      staff: { class: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Staff' },
      user: { class: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'User' },
    };
    return badges[role] || { class: 'bg-gray-100 text-gray-700 border-gray-200', label: role };
  };

  const badge = getRoleBadge(user?.role);

  // Menu items berdasarkan role
  const menuItems = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Package, label: 'Kelola Alat', path: '/admin/alat' },
      { icon: FolderTree, label: 'Kategori', path: '/admin/kategori' },
      { icon: MapPin, label: 'Lokasi', path: '/admin/lokasi' },
      { icon: Users, label: 'Pengguna', path: '/admin/users' },
      { icon: ClipboardList, label: 'Peminjaman', path: '/admin/peminjaman' },
      { icon: RotateCcw, label: 'Pengembalian', path: '/admin/pengembalian' },
    ],
    staff: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard' },
      { icon: ClipboardList, label: 'Peminjaman', path: '/staff/peminjaman' },
      { icon: RotateCcw, label: 'Pengembalian', path: '/staff/pengembalian' },
    ],
    user: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/user/dashboard' },
      { icon: BookOpen, label: 'Katalog Alat', path: '/user/katalog' },
      { icon: History, label: 'Riwayat Pinjam', path: '/user/riwayat' },
    ],
  };

  const currentMenu = menuItems[user?.role] || [];
  const canSeeNotifications = user?.role === 'admin' || user?.role === 'staff';

  const getActivityIcon = (activity) => {
    if (!activity) return Activity;
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('peminjaman') || activityLower.includes('pinjam')) return ClipboardList;
    if (activityLower.includes('pengembalian') || activityLower.includes('kembali')) return RotateCcw;
    if (activityLower.includes('alat')) return Package;
    if (activityLower.includes('user') || activityLower.includes('pengguna')) return Users;
    if (activityLower.includes('kategori')) return FolderTree;
    if (activityLower.includes('lokasi')) return MapPin;
    return Activity;
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // seconds

      if (diff < 60) return 'Baru saja';
      if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return '-';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden"
            onClick={closeSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-50 h-screen
            w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header - Logo */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24">
                      <path fill="#fff" d="M5 21q-.825 0-1.412-.587T3 19V6.525q0-.35.113-.675t.337-.6L4.7 3.725q.275-.35.687-.538T6.25 3h11.5q.45 0 .863.188t.687.537l1.25 1.525q.225.275.338.6t.112.675V19q0 .825-.587 1.413T19 21zm.4-15h13.2l-.85-1H6.25zM16 8H8v8l4-2l4 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Digitory</h1>
                    <p className="text-xs text-gray-500">Inventory System</p>
                  </div>
                </div>

                <button
                  onClick={closeSidebar}
                  className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {currentMenu.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <NavLink
                        to={item.path}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-semibold text-gray-900 mb-1">Digitory v1.0</p>
                <p className="text-xs text-gray-600">© 2024 All rights reserved</p>
              </div>
            </div>
          </div>
        </aside>
      </>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* NAVBAR */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>

              {/* Page Title / Breadcrumb */}
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  Selamat Datang, {user?.name}!
                </h2>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Bell Notification - ONLY for Admin & Staff */}
              {canSeeNotifications && (
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowDropdown(false);
                    }}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[500px] overflow-hidden flex flex-col">
                      {/* Header */}
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-gray-900">Log Aktifitas</h3>
                        </div>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Logs List */}
                      <div className="flex-1 overflow-y-auto">
                        {logs.length > 0 ? (
                          <ul className="divide-y divide-gray-100">
                            {logs.map((log, index) => {
                              const ActivityIcon = getActivityIcon(log.aktivitas);
                              return (
                                <li 
                                  key={log.id || index} 
                                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  <div className="flex gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0 h-fit">
                                      <ActivityIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {log.user?.name || 'System'}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {log.aktivitas || log.keterangan || 'Aktifitas sistem'}
                                      </p>
                                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {formatTimestamp(log.created_at || log.waktu)}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 px-4">
                            <Activity className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">Tidak ada log aktifitas</p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {logs.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <button 
                            onClick={() => {
                              setUnreadCount(0);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center py-1"
                          >
                            Tandai semua sudah dibaca
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </span>
                    <span className="text-xs text-gray-500">{badge.label}</span>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.class} inline-block mt-1`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-rose-50 rounded-lg w-full text-left transition-colors text-rose-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;