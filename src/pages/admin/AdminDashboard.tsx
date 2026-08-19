import { useEffect, useState } from 'react';
import { FolderGit2, Award, Wrench, Briefcase, GraduationCap, Mail, Clock, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchActivityLogs } from '@/services/data';
import type { AdminActivityLog } from '@/types';
import { Card } from '@/components/admin/AdminUI';
import type { AdminPage } from '@/components/admin/AdminLayout';

interface DashboardStats {
  projects: number;
  certificates: number;
  skills: number;
  experiences: number;
  education: number;
  unreadMessages: number;
  lastUpdated: string | null;
}

interface DashboardProps {
  realtimeStatus: 'connected' | 'reconnecting' | 'disconnected';
  onNavigate: (page: AdminPage) => void;
}

export function AdminDashboard({ realtimeStatus, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0, certificates: 0, skills: 0, experiences: 0, education: 0, unreadMessages: 0, lastUpdated: null,
  });
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, s, e, ed, m, profile, activityLogs] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact', head: true }),
          supabase.from('certificates').select('id', { count: 'exact', head: true }),
          supabase.from('skills').select('id', { count: 'exact', head: true }),
          supabase.from('experience').select('id', { count: 'exact', head: true }),
          supabase.from('education').select('id', { count: 'exact', head: true }),
          supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('profile').select('updated_at').maybeSingle(),
          fetchActivityLogs(8),
        ]);

        setStats({
          projects: p.count ?? 0,
          certificates: c.count ?? 0,
          skills: s.count ?? 0,
          experiences: e.count ?? 0,
          education: ed.count ?? 0,
          unreadMessages: m.count ?? 0,
          lastUpdated: profile.data?.updated_at ?? null,
        });
        setLogs(activityLogs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FolderGit2, page: 'projects' as AdminPage, color: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400' },
    { label: 'Certificates', value: stats.certificates, icon: Award, page: 'certificates' as AdminPage, color: 'from-pink-500/20 to-pink-500/5 text-pink-400' },
    { label: 'Skills', value: stats.skills, icon: Wrench, page: 'skills' as AdminPage, color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400' },
    { label: 'Experience', value: stats.experiences, icon: Briefcase, page: 'experience' as AdminPage, color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400' },
    { label: 'Education', value: stats.education, icon: GraduationCap, page: 'education' as AdminPage, color: 'from-amber-500/20 to-amber-500/5 text-amber-400' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: Mail, page: 'messages' as AdminPage, color: 'from-rose-500/20 to-rose-500/5 text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Overview of your portfolio content and activity.</p>
      </div>

      {/* System health */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HealthCard label="Database" status="connected" />
        <HealthCard label="Realtime" status={realtimeStatus === 'connected' ? 'connected' : 'reconnecting'} />
        <HealthCard label="Storage" status="connected" />
        <HealthCard label="Email" status="configured" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => onNavigate(stat.page)}
              className="group rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-left transition-all hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${stat.color} p-2.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex-shrink-0 h-2 w-2 rounded-full bg-indigo-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 truncate">{log.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {log.table_name} {log.details ? `· ${log.details}` : ''}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-slate-600">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Last updated */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">Portfolio Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Last Updated</span>
              </div>
              <span className="text-sm text-slate-400">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                {realtimeStatus === 'connected' ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
                <span className="text-sm text-slate-300">Realtime Sync</span>
              </div>
              <span className={`text-sm font-medium ${realtimeStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {realtimeStatus === 'connected' ? 'Live' : 'Reconnecting'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Total Content Items</span>
              </div>
              <span className="text-sm text-slate-400">
                {stats.projects + stats.certificates + stats.skills + stats.experiences + stats.education}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HealthCard({ label, status }: { label: string; status: 'connected' | 'reconnecting' | 'configured' }) {
  const colorMap = {
    connected: 'text-emerald-400 bg-emerald-500/10',
    reconnecting: 'text-amber-400 bg-amber-500/10',
    configured: 'text-emerald-400 bg-emerald-500/10',
  };
  const labelMap = {
    connected: 'Connected',
    reconnecting: 'Reconnecting',
    configured: 'Configured',
  };
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${colorMap[status].split(' ')[0].replace('text-', 'bg-')}`} />
        <span className={`text-sm font-medium ${colorMap[status].split(' ')[0]}`}>{labelMap[status]}</span>
      </div>
    </div>
  );
}
