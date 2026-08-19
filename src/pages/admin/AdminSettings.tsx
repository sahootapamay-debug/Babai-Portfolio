import { useEffect, useState, useCallback } from 'react';
import { Download, Upload, Database, Cloud, Wifi, Mail, ShieldCheck, Loader2, FileJson } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity, fetchPortfolioData } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, Card, SaveButton } from '@/components/admin/AdminUI';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import type { SiteSettings, PortfolioData } from '@/types';

export function AdminSettings() {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [importConfirm, setImportConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('*').maybeSingle().then(({ data }) => {
      setSettings(data as SiteSettings | null);
      setLoading(false);
    });
    // Check if RESEND_API_KEY is configured by calling the edge function health endpoint
    supabase.functions.invoke('send-contact-email', { body: { healthCheck: true } })
      .then(({ data }) => setEmailConfigured(data?.configured ?? false))
      .catch(() => setEmailConfigured(false));
  }, []);

  const update = (field: keyof SiteSettings, value: string | boolean) => {
    setSettings((s) => s ? { ...s, [field]: value } : s);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error: err } = await supabase.from('site_settings').update({
        site_name: settings.site_name,
        logo_text: settings.logo_text,
        favicon_url: settings.favicon_url,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,
        dark_mode: settings.dark_mode,
      }).eq('id', settings.id);
      if (err) throw err;
      await logActivity('Updated site settings', 'site_settings', settings.id);
      success('Site settings saved');
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = useCallback(async () => {
    try {
      const data = await fetchPortfolioData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Backup exported');
    } catch {
      error('Failed to export backup');
    }
  }, [success, error]);

  const openJsonEditor = async () => {
    try {
      const data = await fetchPortfolioData();
      setJsonText(JSON.stringify(data, null, 2));
      setJsonError(null);
      setJsonOpen(true);
    } catch {
      error('Failed to load data for editor');
    }
  };

  const validateAndPreview = (): PortfolioData | null => {
    try {
      const parsed = JSON.parse(jsonText) as PortfolioData;
      setJsonError(null);
      return parsed;
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
      return null;
    }
  };

  const handleImport = async () => {
    const parsed = validateAndPreview();
    if (!parsed) return;
    setImportConfirm(true);
  };

  const confirmImport = async () => {
    setImportConfirm(false);
    setImporting(true);
    try {
      const parsed = JSON.parse(jsonText) as PortfolioData;
      // Update single-row tables
      if (parsed.profile) {
        const { id, created_at, updated_at, ...rest } = parsed.profile;
        await supabase.from('profile').update(rest).eq('id', parsed.profile.id).maybeSingle();
      }
      if (parsed.socialLinks) {
        const { id, updated_at, ...rest } = parsed.socialLinks;
        await supabase.from('social_links').update(rest).eq('id', parsed.socialLinks.id).maybeSingle();
      }
      if (parsed.siteSettings) {
        const { id, updated_at, ...rest } = parsed.siteSettings;
        await supabase.from('site_settings').update(rest).eq('id', parsed.siteSettings.id).maybeSingle();
      }
      if (parsed.contactSettings) {
        const { id, updated_at, ...rest } = parsed.contactSettings;
        await supabase.from('contact_settings').update(rest).eq('id', parsed.contactSettings.id).maybeSingle();
      }
      if (parsed.seoSettings) {
        const { id, updated_at, ...rest } = parsed.seoSettings;
        await supabase.from('seo_settings').update(rest).eq('id', parsed.seoSettings.id).maybeSingle();
      }

      // Replace array tables
      if (parsed.skills) {
        await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (parsed.skills.length > 0) {
          const rows = parsed.skills.map(({ id, created_at, updated_at, ...rest }) => rest);
          await supabase.from('skills').insert(rows);
        }
      }
      if (parsed.education) {
        await supabase.from('education').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (parsed.education.length > 0) {
          const rows = parsed.education.map(({ id, created_at, updated_at, ...rest }) => rest);
          await supabase.from('education').insert(rows);
        }
      }
      if (parsed.experience) {
        await supabase.from('experience').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (parsed.experience.length > 0) {
          const rows = parsed.experience.map(({ id, created_at, updated_at, ...rest }) => rest);
          await supabase.from('experience').insert(rows);
        }
      }
      if (parsed.projects) {
        await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (parsed.projects.length > 0) {
          const rows = parsed.projects.map(({ id, created_at, updated_at, ...rest }) => rest);
          await supabase.from('projects').insert(rows);
        }
      }
      if (parsed.certificates) {
        await supabase.from('certificates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (parsed.certificates.length > 0) {
          const rows = parsed.certificates.map(({ id, created_at, updated_at, ...rest }) => rest);
          await supabase.from('certificates').insert(rows);
        }
      }
      if (parsed.navigation) {
        await supabase.from('navigation').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (parsed.navigation.length > 0) {
          const rows = parsed.navigation.map(({ id, updated_at, ...rest }) => rest);
          await supabase.from('navigation').insert(rows);
        }
      }
      if (parsed.sectionSettings) {
        await supabase.from('section_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (parsed.sectionSettings.length > 0) {
          const rows = parsed.sectionSettings.map(({ id, updated_at, ...rest }) => rest);
          await supabase.from('section_settings').insert(rows);
        }
      }

      await logActivity('Imported portfolio data via JSON', 'site_settings');
      success('Portfolio data imported successfully');
      setJsonOpen(false);
    } catch (e) {
      error(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <div className="py-8 text-slate-400 text-sm">Loading...</div>;
  if (!settings) return <div className="py-8 text-rose-400 text-sm">No settings found.</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Settings" description="Site configuration, system health, backup, and JSON tools." />

      {/* System health */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">System Health</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HealthTile icon={Database} label="Database" value="Connected" ok />
          <HealthTile icon={Wifi} label="Realtime" value="Connected" ok />
          <HealthTile icon={Cloud} label="Storage" value="Connected" ok />
          <HealthTile icon={Mail} label="Email (Resend)" value={emailConfigured === null ? 'Checking...' : emailConfigured ? 'Configured' : 'Not configured'} ok={emailConfigured === true} />
        </div>
        {emailConfigured === false && (
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
            Email is not configured. The contact form will save messages but cannot send email notifications until the RESEND_API_KEY secret is set.
          </div>
        )}
      </Card>

      {/* Site settings */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Site Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Site Name</label>
            <input className="input-field" value={settings.site_name} onChange={(e) => update('site_name', e.target.value)} />
          </div>
          <div>
            <label className="label-field">Logo Text</label>
            <input className="input-field" value={settings.logo_text} onChange={(e) => update('logo_text', e.target.value)} maxLength={3} />
          </div>
          <div>
            <label className="label-field">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.primary_color} onChange={(e) => update('primary_color', e.target.value)} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent" />
              <input className="input-field flex-1" value={settings.primary_color} onChange={(e) => update('primary_color', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-field">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.secondary_color} onChange={(e) => update('secondary_color', e.target.value)} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent" />
              <input className="input-field flex-1" value={settings.secondary_color} onChange={(e) => update('secondary_color', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-field">Accent Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.accent_color} onChange={(e) => update('accent_color', e.target.value)} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent" />
              <input className="input-field flex-1" value={settings.accent_color} onChange={(e) => update('accent_color', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-field">Favicon URL</label>
            <input className="input-field" value={settings.favicon_url ?? ''} onChange={(e) => update('favicon_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={settings.dark_mode} onChange={(e) => update('dark_mode', e.target.checked)} className="rounded accent-indigo-500" />
            Dark mode (default theme)
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <SaveButton onSave={handleSave} saving={saving} />
        </div>
      </Card>

      {/* Backup & JSON */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Backup & JSON Tools</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <button onClick={handleExport} className="btn-secondary justify-start">
            <Download className="w-4 h-4" /> Export Backup
          </button>
          <button onClick={openJsonEditor} className="btn-secondary justify-start">
            <FileJson className="w-4 h-4" /> JSON Editor
          </button>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" />
            Signed in as {user?.email}
          </div>
        </div>
      </Card>

      {/* JSON Editor Modal */}
      <Modal
        open={jsonOpen}
        onClose={() => setJsonOpen(false)}
        title="Portfolio JSON Editor"
        size="xl"
        footer={
          <>
            <button onClick={() => setJsonOpen(false)} className="btn-secondary">Close</button>
            <button onClick={() => { const ok = validateAndPreview(); if (ok) success('JSON is valid'); }} className="btn-secondary">
              Validate
            </button>
            <button onClick={handleImport} disabled={importing} className="btn-primary">
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4" /> Import & Apply</>}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Edit your portfolio data as JSON. Click <strong className="text-slate-300">Validate</strong> to check syntax, then <strong className="text-slate-300">Import & Apply</strong> to write changes to the database. This will overwrite existing content.
          </p>
          {jsonError && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
              <strong>JSON Error:</strong> {jsonError}
            </div>
          )}
          <textarea
            className="h-[400px] w-full rounded-xl border border-white/10 bg-[#0a0a0f] p-4 font-mono text-xs text-slate-300 scrollbar-thin focus:border-indigo-500/50 focus:outline-none"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={importConfirm}
        title="Import Portfolio Data"
        message="This will overwrite ALL existing portfolio content with the JSON data. Are you sure?"
        confirmLabel="Overwrite & Import"
        destructive
        onConfirm={confirmImport}
        onCancel={() => setImportConfirm(false)}
      />
    </div>
  );
}

function HealthTile({ icon: Icon, label, value, ok }: {
  icon: typeof Database; label: string; value: string; ok: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <Icon className={`w-4 h-4 mb-2 ${ok ? 'text-emerald-400' : 'text-amber-400'}`} />
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${ok ? 'text-emerald-400' : 'text-amber-400'}`}>{value}</p>
    </div>
  );
}

