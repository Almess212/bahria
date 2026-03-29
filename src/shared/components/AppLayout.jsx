import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Map, Compass, BookOpen, Camera, Menu, LogOut, Database, Edit, Package, User, Languages } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { USER_ROLES } from '../../config/supabase';
import { useTranslation } from '../../i18n/translations';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuthStore();
  const { sidebarOpen, toggleSidebar, language, setLanguage } = useAppStore();
  const t = useTranslation(language);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  // Navigation selon le rôle
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    ];

    if (role === USER_ROLES.ADMIN || role === USER_ROLES.FACTORY || role === USER_ROLES.SCIENTIST) {
      baseItems.push({ path: '/analysis', icon: FlaskConical, label: t.nav.analysis });
    }

    if (role === USER_ROLES.ADMIN || role === USER_ROLES.FISHERMAN || role === USER_ROLES.SCIENTIST) {
      baseItems.push({ path: '/map', icon: Map, label: t.nav.map });
    }

    if (role === USER_ROLES.ADMIN || role === USER_ROLES.FISHERMAN) {
      baseItems.push({ path: '/assistant', icon: Compass, label: t.nav.assistant });
      baseItems.push({ path: '/logbook', icon: BookOpen, label: t.nav.logbook });
      baseItems.push({ path: '/profile', icon: User, label: t.nav.profile });
    }

    if (role === USER_ROLES.ADMIN || role === USER_ROLES.FACTORY) {
      baseItems.push({ path: '/cam', icon: Camera, label: t.nav.cam });
      baseItems.push({ path: '/dataset-library', icon: Package, label: t.nav.library });
      baseItems.push({ path: '/data-management', icon: Database, label: t.nav.datasets });
      baseItems.push({ path: '/annotation', icon: Edit, label: t.nav.annotation });
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-[#041E42] text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Menu Toggle */}
        <div className="h-16 flex items-center justify-end px-4 border-b border-white/10">
          <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-[#0EA5E9] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-white/10 p-4">
          {sidebarOpen ? (
            <div className="mb-3">
              <p className="text-sm font-medium truncate">{user?.email || 'Demo'}</p>
              <p className="text-xs text-white/60 capitalize">{role}</p>
            </div>
          ) : null}

          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
            className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors mb-2"
          >
            <Languages className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">{language === 'ar' ? 'Français' : 'العربية'}</span>}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">{t.nav.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BAHRIA" className="h-12 object-contain" />
            <span className="text-[#0EA5E9] font-semibold text-2xl">بحرية</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
