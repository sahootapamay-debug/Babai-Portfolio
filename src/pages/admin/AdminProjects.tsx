import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Star, FolderGit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, EmptyState, StatusBadge } from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import type { Project } from '@/types';

export function AdminProjects() {
  const { success, error } = useToast();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const load = async () => {
    const { data, error: err } = await supabase.from('projects').select('*').order('sort_order');
    if (err) { error('Failed to load projects'); return; }
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({
      id: '', title: '', description: '', technologies: '', project_url: '', github_url: '',
      image_url: '', category: 'Finance', featured: false, sort_order: items.length,
      visible: true, created_at: '', updated_at: '',
    });
    setModalOpen(true);
  };

  const openEdit = (p: Project) => { setEditing({ ...p }); setModalOpen(true); };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { error('Project name is required'); return; }

    try {
      if (editing.id) {
        const { error: err } = await supabase.from('projects').update({
          title: editing.title, description: editing.description, technologies: editing.technologies,
          project_url: editing.project_url, github_url: editing.github_url, image_url: editing.image_url,
          category: editing.category, featured: editing.featured, sort_order: editing.sort_order,
          visible: editing.visible,
        }).eq('id', editing.id);
        if (err) throw err;
        await logActivity('Updated project', 'projects', editing.id, editing.title);
        success('Project updated');
      } else {
        const { error: err } = await supabase.from('projects').insert({
          title: editing.title, description: editing.description, technologies: editing.technologies,
          project_url: editing.project_url, github_url: editing.github_url, image_url: editing.image_url,
          category: editing.category, featured: editing.featured, sort_order: editing.sort_order,
          visible: editing.visible,
        });
        if (err) throw err;
        await logActivity('Added project', 'projects', undefined, editing.title);
        success('Project added');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save project');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: err } = await supabase.from('projects').delete().eq('id', deleteTarget.id);
      if (err) throw err;
      await logActivity('Deleted project', 'projects', deleteTarget.id, deleteTarget.title);
      success('Project deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to delete project');
    }
  };

  const toggleVisible = async (p: Project) => {
    await supabase.from('projects').update({ visible: !p.visible }).eq('id', p.id);
    load();
  };

  const toggleFeatured = async (p: Project) => {
    await supabase.from('projects').update({ featured: !p.featured }).eq('id', p.id);
    load();
  };

  const moveOrder = async (p: Project, dir: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === p.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from('projects').update({ sort_order: other.sort_order }).eq('id', p.id),
      supabase.from('projects').update({ sort_order: p.sort_order }).eq('id', other.id),
    ]);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your project portfolio."
        action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Project</button>}
      />

      {loading ? (
        <div className="py-8 text-slate-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<FolderGit2 className="w-8 h-8" />} title="No projects yet" description="Add your first project to showcase your work." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Project</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.sort((a, b) => a.sort_order - b.sort_order).map((p, idx) => (
            <Card key={p.id} className="!p-4">
              <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-white/5">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                    <FolderGit2 className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-white line-clamp-1">{p.title}</h3>
                {p.featured && <Star className="w-4 h-4 flex-shrink-0 text-amber-400 fill-amber-400" />}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-2">{p.description ?? 'No description'}</p>
              {p.technologies && <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">{p.technologies}</p>}
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge visible={p.visible} />
                {p.category && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{p.category}</span>}
              </div>
              <div className="flex items-center gap-1 border-t border-white/5 pt-3">
                <button onClick={() => moveOrder(p, 'up')} disabled={idx === 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20" aria-label="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => moveOrder(p, 'down')} disabled={idx === items.length - 1} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-20" aria-label="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleFeatured(p)} className={`rounded-lg p-1.5 hover:bg-white/5 ${p.featured ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`} aria-label="Toggle featured"><Star className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleVisible(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Toggle visibility">{p.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                <div className="flex-1" />
                <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing?.id ? 'Edit Project' : 'Add Project'}
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
              <label className="label-field">Project Name</label>
              <input className="input-field" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Description</label>
              <textarea className="input-field min-h-[80px] resize-y" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Technologies (comma-separated)</label>
              <input className="input-field" value={editing.technologies ?? ''} onChange={(e) => setEditing({ ...editing, technologies: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Category</label>
              <input className="input-field" value={editing.category ?? ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Project URL</label>
              <input className="input-field" value={editing.project_url ?? ''} onChange={(e) => setEditing({ ...editing, project_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="label-field">GitHub URL</label>
              <input className="input-field" value={editing.github_url ?? ''} onChange={(e) => setEditing({ ...editing, github_url: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div className="sm:col-span-2">
              <ImageUploader
                bucket={STORAGE_BUCKETS.projects as unknown as keyof typeof STORAGE_BUCKETS}
                currentUrl={editing.image_url}
                onUpload={(url) => setEditing({ ...editing, image_url: url })}
                onRemove={() => setEditing({ ...editing, image_url: '' })}
                label="Project Image"
                aspectRatio="video"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="rounded accent-indigo-500" />
                Featured project
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} className="rounded accent-indigo-500" />
                Visible on portfolio
              </label>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

