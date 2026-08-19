import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Award, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, EmptyState, StatusBadge } from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { getIcon, availableIcons } from '@/utils/icons';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import type { Certificate } from '@/types';

const GRADIENTS = [
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-fuchsia-500',
  'from-sky-500 to-indigo-500',
  'from-rose-500 to-pink-500',
];

export function AdminCertificates() {
  const { success, error } = useToast();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);

  const load = async () => {
    const { data, error: err } = await supabase.from('certificates').select('*').order('sort_order');
    if (err) { error('Failed to load certificates'); return; }
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({
      id: '', name: '', issuer: '', year: '', icon: 'Award', gradient: GRADIENTS[0],
      certificate_url: '', image_url: '', sort_order: items.length, visible: true,
      created_at: '', updated_at: '',
    });
    setModalOpen(true);
  };

  const openEdit = (c: Certificate) => { setEditing({ ...c }); setModalOpen(true); };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { error('Certificate name is required'); return; }
    if (!editing.issuer.trim()) { error('Issuer is required'); return; }

    try {
      if (editing.id) {
        const { error: err } = await supabase.from('certificates').update({
          name: editing.name, issuer: editing.issuer, year: editing.year, icon: editing.icon,
          gradient: editing.gradient, certificate_url: editing.certificate_url, image_url: editing.image_url,
          sort_order: editing.sort_order, visible: editing.visible,
        }).eq('id', editing.id);
        if (err) throw err;
        await logActivity('Updated certificate', 'certificates', editing.id, editing.name);
        success('Certificate updated');
      } else {
        const { error: err } = await supabase.from('certificates').insert({
          name: editing.name, issuer: editing.issuer, year: editing.year, icon: editing.icon,
          gradient: editing.gradient, certificate_url: editing.certificate_url, image_url: editing.image_url,
          sort_order: editing.sort_order, visible: editing.visible,
        });
        if (err) throw err;
        await logActivity('Added certificate', 'certificates', undefined, editing.name);
        success('Certificate added');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save certificate');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: err } = await supabase.from('certificates').delete().eq('id', deleteTarget.id);
      if (err) throw err;
      await logActivity('Deleted certificate', 'certificates', deleteTarget.id, deleteTarget.name);
      success('Certificate deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to delete certificate');
    }
  };

  const toggleVisible = async (c: Certificate) => {
    await supabase.from('certificates').update({ visible: !c.visible }).eq('id', c.id);
    load();
  };

  const moveOrder = async (c: Certificate, dir: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === c.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from('certificates').update({ sort_order: other.sort_order }).eq('id', c.id),
      supabase.from('certificates').update({ sort_order: c.sort_order }).eq('id', other.id),
    ]);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Manage your certifications and achievements."
        action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Certificate</button>}
      />

      {loading ? (
        <div className="py-8 text-slate-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Award className="w-8 h-8" />} title="No certificates yet" description="Add your first certificate to showcase your achievements." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Certificate</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.sort((a, b) => a.sort_order - b.sort_order).map((c, idx) => {
            const Icon = getIcon(c.icon);
            return (
              <Card key={c.id} className="!p-4">
                <div className={`mb-3 aspect-video overflow-hidden rounded-lg bg-gradient-to-br ${c.gradient} relative`}>
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/80">
                      <Icon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white line-clamp-1">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.issuer} · {c.year}</p>
                <div className="flex items-center gap-2 mt-2 mb-3">
                  <StatusBadge visible={c.visible} />
                  {c.certificate_url && <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400"><ExternalLink className="w-3 h-3" /> Has URL</span>}
                </div>
                <div className="flex items-center gap-1 border-t border-white/5 pt-3">
                  <button onClick={() => moveOrder(c, 'up')} disabled={idx === 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20" aria-label="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveOrder(c, 'down')} disabled={idx === items.length - 1} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20" aria-label="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toggleVisible(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Toggle visibility">{c.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                  <div className="flex-1" />
                  <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing?.id ? 'Edit Certificate' : 'Add Certificate'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save</button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-field">Certificate Name</label>
              <input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Issuer</label>
              <input className="input-field" value={editing.issuer} onChange={(e) => setEditing({ ...editing, issuer: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Year</label>
              <input className="input-field" value={editing.year} onChange={(e) => setEditing({ ...editing, year: e.target.value })} placeholder="2025" />
            </div>
            <div>
              <label className="label-field">Icon</label>
              <select className="input-field" value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
                {availableIcons.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Gradient</label>
              <select className="input-field" value={editing.gradient} onChange={(e) => setEditing({ ...editing, gradient: e.target.value })}>
                {GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Certificate URL (optional)</label>
              <input className="input-field" value={editing.certificate_url ?? ''} onChange={(e) => setEditing({ ...editing, certificate_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <ImageUploader
                bucket={STORAGE_BUCKETS.certificates as unknown as keyof typeof STORAGE_BUCKETS}
                currentUrl={editing.image_url}
                onUpload={(url) => setEditing({ ...editing, image_url: url })}
                onRemove={() => setEditing({ ...editing, image_url: '' })}
                label="Certificate Image"
                aspectRatio="video"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer sm:col-span-2">
              <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} className="rounded accent-indigo-500" />
              Visible on portfolio
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Certificate"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
