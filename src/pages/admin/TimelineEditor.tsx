import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, EmptyState, StatusBadge } from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Education, Experience, TableName } from '@/types';

interface TimelineEditorProps {
  table: TableName;
  title: string;
  description: string;
  icon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  yearLabel: string;
  yearPlaceholder: string;
}

type TimelineItem = Education | Experience;

export function TimelineEditor({
  table, title, description, icon, emptyTitle, emptyDescription, yearLabel, yearPlaceholder,
}: TimelineEditorProps) {
  const { success, error } = useToast();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimelineItem | null>(null);

  const load = async () => {
    const { data, error: err } = await supabase.from(table).select('*').order('sort_order');
    if (err) { error('Failed to load'); return; }
    setItems((data ?? []) as TimelineItem[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [table]);

  const openNew = () => {
    setEditing({
      id: '', year: '', title: '', organization: '', tags: '', description: '',
      sort_order: items.length, visible: true, created_at: '', updated_at: '',
    } as TimelineItem);
    setModalOpen(true);
  };

  const openEdit = (item: TimelineItem) => {
    setEditing({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { error('Title is required'); return; }
    if (!editing.organization.trim()) { error('Organization is required'); return; }

    try {
      if (editing.id) {
        const { error: err } = await supabase.from(table).update({
          year: editing.year, title: editing.title, organization: editing.organization,
          tags: editing.tags, description: editing.description, sort_order: editing.sort_order,
          visible: editing.visible,
        }).eq('id', editing.id);
        if (err) throw err;
        await logActivity('Updated ' + table, table, editing.id, editing.title);
        success('Updated successfully');
      } else {
        const { error: err } = await supabase.from(table).insert({
          year: editing.year, title: editing.title, organization: editing.organization,
          tags: editing.tags, description: editing.description, sort_order: editing.sort_order,
          visible: editing.visible,
        });
        if (err) throw err;
        await logActivity('Added ' + table, table, undefined, editing.title);
        success('Added successfully');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: err } = await supabase.from(table).delete().eq('id', deleteTarget.id);
      if (err) throw err;
      await logActivity('Deleted ' + table, table, deleteTarget.id, deleteTarget.title);
      success('Deleted successfully');
      setDeleteTarget(null);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const toggleVisible = async (item: TimelineItem) => {
    const { error: err } = await supabase.from(table).update({ visible: !item.visible }).eq('id', item.id);
    if (err) { error('Failed to toggle'); return; }
    load();
  };

  const moveOrder = async (item: TimelineItem, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from(table).update({ sort_order: other.sort_order }).eq('id', item.id),
      supabase.from(table).update({ sort_order: item.sort_order }).eq('id', other.id),
    ]);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Entry</button>}
      />

      {loading ? (
        <div className="py-8 text-slate-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Entry</button>} />
      ) : (
        <div className="space-y-3">
          {items.sort((a, b) => a.sort_order - b.sort_order).map((item, idx) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex flex-col gap-0.5 sm:pt-1">
                  <button onClick={() => moveOrder(item, 'up')} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-20" aria-label="Move up"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => moveOrder(item, 'down')} disabled={idx === items.length - 1} className="text-slate-500 hover:text-white disabled:opacity-20" aria-label="Move down"><ArrowDown className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">{item.year}</span>
                    <StatusBadge visible={item.visible} />
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{item.organization}</p>
                  {item.tags && (
                    <p className="text-xs text-slate-500 mt-1.5 uppercase tracking-wider">{item.tags}</p>
                  )}
                  {item.description && (
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:flex-col">
                  <button onClick={() => toggleVisible(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Toggle visibility">
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing?.id ? 'Edit Entry' : 'Add Entry'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save</button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="label-field">{yearLabel}</label>
              <input className="input-field" value={editing.year} onChange={(e) => setEditing({ ...editing, year: e.target.value })} placeholder={yearPlaceholder} />
            </div>
            <div>
              <label className="label-field">Title</label>
              <input className="input-field" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Organization</label>
              <input className="input-field" value={editing.organization} onChange={(e) => setEditing({ ...editing, organization: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Tags (comma-separated)</label>
              <input className="input-field" value={editing.tags ?? ''} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="Finance, Banking, Analysis" />
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea className="input-field min-h-[100px] resize-y" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} className="rounded accent-indigo-500" />
              Visible on portfolio
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Entry"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

