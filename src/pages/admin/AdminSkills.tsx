import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, EmptyState, StatusBadge } from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getIcon, availableIcons } from '@/utils/icons';
import type { Skill } from '@/types';

export function AdminSkills() {
  const { success, error } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const load = async () => {
    const { data, error: err } = await supabase.from('skills').select('*').order('sort_order');
    if (err) { error('Failed to load skills'); return; }
    setSkills(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const groups = Array.from(new Set(skills.map((s) => s.group_name)));

  const openNew = () => {
    setEditing({
      id: '', group_name: 'Technical', name: '', icon: 'Code', level: 80,
      sort_order: skills.length, visible: true, created_at: '', updated_at: '',
    });
    setModalOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setEditing({ ...skill });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { error('Skill name is required'); return; }

    try {
      if (editing.id) {
        const { error: err } = await supabase.from('skills').update({
          group_name: editing.group_name, name: editing.name, icon: editing.icon,
          level: editing.level, sort_order: editing.sort_order, visible: editing.visible,
        }).eq('id', editing.id);
        if (err) throw err;
        await logActivity('Updated skill', 'skills', editing.id, editing.name);
        success('Skill updated');
      } else {
        const { error: err } = await supabase.from('skills').insert({
          group_name: editing.group_name, name: editing.name, icon: editing.icon,
          level: editing.level, sort_order: editing.sort_order, visible: editing.visible,
        });
        if (err) throw err;
        await logActivity('Added skill', 'skills', undefined, editing.name);
        success('Skill added');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save skill');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: err } = await supabase.from('skills').delete().eq('id', deleteTarget.id);
      if (err) throw err;
      await logActivity('Deleted skill', 'skills', deleteTarget.id, deleteTarget.name);
      success('Skill deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to delete skill');
    }
  };

  const toggleVisible = async (skill: Skill) => {
    const { error: err } = await supabase.from('skills').update({ visible: !skill.visible }).eq('id', skill.id);
    if (err) { error('Failed to toggle visibility'); return; }
    load();
  };

  const moveOrder = async (skill: Skill, direction: 'up' | 'down') => {
    const sorted = [...skills].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === skill.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from('skills').update({ sort_order: other.sort_order }).eq('id', skill.id),
      supabase.from('skills').update({ sort_order: skill.sort_order }).eq('id', other.id),
    ]);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Manage your skill groups and proficiency levels."
        action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Skill</button>}
      />

      {loading ? (
        <div className="py-8 text-slate-400 text-sm">Loading skills...</div>
      ) : skills.length === 0 ? (
        <EmptyState icon={<Wrench className="w-8 h-8" />} title="No skills yet" description="Add your first skill to showcase your expertise." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Skill</button>} />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const groupSkills = skills.filter((s) => s.group_name === group).sort((a, b) => a.sort_order - b.sort_order);
            return (
              <Card key={group}>
                <h3 className="text-sm font-semibold text-white mb-4">{group}</h3>
                <div className="space-y-2">
                  {groupSkills.map((skill, idx) => {
                    const Icon = getIcon(skill.icon);
                    return (
                      <div key={skill.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveOrder(skill, 'up')} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-20" aria-label="Move up"><GripVertical className="w-3 h-3 rotate-180" /></button>
                          <button onClick={() => moveOrder(skill, 'down')} disabled={idx === groupSkills.length - 1} className="text-slate-500 hover:text-white disabled:opacity-20" aria-label="Move down"><GripVertical className="w-3 h-3" /></button>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200">{skill.name}</p>
                          <div className="mt-1.5 h-1.5 w-full max-w-xs rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" style={{ width: `${skill.level}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{skill.level}%</span>
                        <StatusBadge visible={skill.visible} />
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleVisible(skill)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Toggle visibility">
                            {skill.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEdit(skill)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(skill)} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing?.id ? 'Edit Skill' : 'Add Skill'}
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
              <label className="label-field">Group Name</label>
              <input className="input-field" value={editing.group_name} onChange={(e) => setEditing({ ...editing, group_name: e.target.value })} list="skill-groups" />
              <datalist id="skill-groups">
                {groups.map((g) => <option key={g} value={g} />)}
              </datalist>
              <p className="mt-1 text-xs text-slate-500">Type any group name — existing groups will autocomplete.</p>
            </div>
            <div>
              <label className="label-field">Skill Name</label>
              <input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Icon</label>
              <select className="input-field" value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
                {availableIcons.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Level ({editing.level}%)</label>
              <input type="range" min={0} max={100} value={editing.level} onChange={(e) => setEditing({ ...editing, level: Number(e.target.value) })} className="w-full accent-indigo-500" />
            </div>
            <div className="flex items-center gap-3">
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
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
