import { useEffect, useState } from 'react';
import { AdminLayout, type AdminPage } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProfile } from '@/pages/admin/AdminProfile';
import { AdminSocial } from '@/pages/admin/AdminSocial';
import { AdminSkills } from '@/pages/admin/AdminSkills';
import { TimelineEditor } from '@/pages/admin/TimelineEditor';
import { AdminProjects } from '@/pages/admin/AdminProjects';
import { AdminCertificates } from '@/pages/admin/AdminCertificates';
import { AdminContact } from '@/pages/admin/AdminContact';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import { AdminSeo } from '@/pages/admin/AdminSeo';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminApp() {
  const [page, setPage] = useState<AdminPage>('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');

  // Unread message count + realtime
  useEffect(() => {
    const loadCount = async () => {
      const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'new');
      setUnreadCount(count ?? 0);
    };
    loadCount();

    const channel = supabase
      .channel('admin-messages-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => loadCount())
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setRealtimeStatus('reconnecting');
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <AdminDashboard realtimeStatus={realtimeStatus} onNavigate={setPage} />;
      case 'profile': return <AdminProfile />;
      case 'social': return <AdminSocial />;
      case 'skills': return <AdminSkills />;
      case 'education': return (
        <TimelineEditor
          table="education"
          title="Education"
          description="Your academic background and qualifications."
          icon={<GraduationCap className="w-8 h-8" />}
          emptyTitle="No education entries"
          emptyDescription="Add your first education entry to show your academic journey."
          yearLabel="Year / Period"
          yearPlaceholder="2023 — 2026"
        />
      );
      case 'experience': return (
        <TimelineEditor
          table="experience"
          title="Experience"
          description="Your work experience and internships."
          icon={<Briefcase className="w-8 h-8" />}
          emptyTitle="No experience entries"
          emptyDescription="Add your first experience entry to show your work history."
          yearLabel="Period"
          yearPlaceholder="Summer 2026"
        />
      );
      case 'projects': return <AdminProjects />;
      case 'certificates': return <AdminCertificates />;
      case 'contact': return <AdminContact />;
      case 'messages': return <AdminMessages />;
      case 'seo': return <AdminSeo />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard realtimeStatus={realtimeStatus} onNavigate={setPage} />;
    }
  };

  return (
    <AdminLayout current={page} onNavigate={setPage} unreadCount={unreadCount} realtimeStatus={realtimeStatus}>
      {renderPage()}
    </AdminLayout>
  );
}
