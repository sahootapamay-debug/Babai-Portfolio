import { supabase } from '@/lib/supabase';
import type {
  PortfolioData, Profile, SocialLinks, SiteSettings, Skill, Education,
  Experience, Project, Certificate, ContactSettings, NavigationItem,
  SectionSetting, SeoSettings, Message, AdminActivityLog, TableName,
} from '@/types';

export async function fetchPortfolioData(): Promise<PortfolioData> {
  const [
    profile, socialLinks, siteSettings, skills, education, experience,
    projects, certificates, contactSettings, navigation, sectionSettings, seoSettings,
  ] = await Promise.all([
    supabase.from('profile').select('*').maybeSingle().then(r => r.data as Profile | null),
    supabase.from('social_links').select('*').maybeSingle().then(r => r.data as SocialLinks | null),
    supabase.from('site_settings').select('*').maybeSingle().then(r => r.data as SiteSettings | null),
    supabase.from('skills').select('*').order('sort_order').then(r => (r.data ?? []) as Skill[]),
    supabase.from('education').select('*').order('sort_order').then(r => (r.data ?? []) as Education[]),
    supabase.from('experience').select('*').order('sort_order').then(r => (r.data ?? []) as Experience[]),
    supabase.from('projects').select('*').order('sort_order').then(r => (r.data ?? []) as Project[]),
    supabase.from('certificates').select('*').order('sort_order').then(r => (r.data ?? []) as Certificate[]),
    supabase.from('contact_settings').select('*').maybeSingle().then(r => r.data as ContactSettings | null),
    supabase.from('navigation').select('*').order('sort_order').then(r => (r.data ?? []) as NavigationItem[]),
    supabase.from('section_settings').select('*').order('sort_order').then(r => (r.data ?? []) as SectionSetting[]),
    supabase.from('seo_settings').select('*').maybeSingle().then(r => r.data as SeoSettings | null),
  ]);

  return {
    profile, socialLinks, siteSettings, skills, education, experience,
    projects, certificates, contactSettings, navigation, sectionSettings, seoSettings,
  };
}

export async function logActivity(
  action: string,
  table: TableName,
  recordId?: string,
  details?: string,
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('admin_activity_logs').insert({
      admin_email: user?.email ?? null,
      action,
      table_name: table,
      record_id: recordId ?? null,
      details: details ?? null,
    });
  } catch {
    // logging is best-effort; never block the main operation
  }
}

export async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActivityLogs(limit = 10): Promise<AdminActivityLog[]> {
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
