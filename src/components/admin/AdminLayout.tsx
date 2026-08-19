import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, User, Link2, Wrench, GraduationCap, Briefcase, FolderGit2,
  Award, Mail, MessageSquare, Search, Settings, Menu, X, LogOut, ExternalLink,
  Wifi, WifiOff, Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export type AdminPage =
  | 'dashboard' | 'profile' | 'social' | 'skills' | 'education' | 'experience'
  | 'projects' | 'certificates' | 'contact' | 'messages' | 'seo' | 'settings';

interface AdminLayoutProps {
  current: AdminPage;
  onNavigate: (page: AdminPage) => void;
  unreadCount: number;
  realtimeStatus: 'connected' | 'reconnecting' | 'disconnected';
  children: ReactNode;
}

const navItems: { key: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'profile', label: 'Profile & Bio', icon: User },
  { key: 'social', label: 'Social Links', icon: Link2 },
  { key: 'skills', label: 'Skills', icon: Wrench },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'projects', label: 'Projects', icon: FolderGit2 },
  { key: 'certificates', label: 'Certificates', icon: Award },
  { key: 'contact', label: 'Contact', icon: Mail },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ current, onNavigate, unreadCount, realtimeStatus, children }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const { success } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    success('Signed out successfully');
  };

  const handleNav = (page: AdminPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const currentItem = navItems.find((n) => n.key === current);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/5 bg-[#0d0d14] transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">AKASH MONDAL</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Portfolio Admin</p>
            </div>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = current === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/10 text-white border border-indigo-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.key === 'messages' && unreadCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/5 p-3">
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
              {realtimeStatus === 'connected' ? (
                <><Wifi className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Live</span></>
              ) : (
                <><WifiOff className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">Reconnecting...</span></>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a href="/" target="_blank" rel="noreferrer" className="btn-ghost flex-1 !px-2 !py-2 text-xs">
                <ExternalLink className="w-3.5 h-3.5" /> View Site
              </a>
              <button onClick={handleSignOut} className="btn-ghost !px-2 !py-2 text-xs text-rose-400 hover:text-rose-300" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-400 hover:text-white" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-white">{currentItem?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('messages')}
              className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Messages"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-slate-300">{user?.email}</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-xs font-bold text-white">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
