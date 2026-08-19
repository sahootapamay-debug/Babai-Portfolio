import { useEffect, useState, useCallback } from 'react';
import { Mail, Trash2, MailOpen, Reply, Archive, Inbox, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, EmptyState } from '@/components/admin/AdminUI';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import type { Message, MessageStatus } from '@/types';

const STATUS_COLORS: Record<MessageStatus, string> = {
  new: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  read: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  replied: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const STATUS_LABELS: Record<MessageStatus, string> = {
  new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived',
};

export function AdminMessages() {
  const { success, error } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MessageStatus | 'all'>('all');
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    let query = supabase.from('messages').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data, error: err } = await query;
    if (err) { error('Failed to load messages'); return; }
    setMessages(data ?? []);
    setLoading(false);
  }, [filter, page, error]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription for messages
  useEffect(() => {
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const updateStatus = async (msg: Message, status: MessageStatus) => {
    const { error: err } = await supabase.from('messages').update({ status }).eq('id', msg.id);
    if (err) { error('Failed to update status'); return; }
    await logActivity(`Marked message as ${status}`, 'messages', msg.id);
    success(`Message marked as ${status}`);
    load();
    if (selected?.id === msg.id) setSelected({ ...msg, status });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error: err } = await supabase.from('messages').delete().eq('id', deleteTarget.id);
    if (err) { error('Failed to delete message'); return; }
    await logActivity('Deleted message', 'messages', deleteTarget.id);
    success('Message deleted');
    setDeleteTarget(null);
    if (selected?.id === deleteTarget.id) setSelected(null);
    load();
  };

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (msg.status === 'new') {
      await updateStatus(msg, 'read');
    }
  };

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Visitor messages from your contact form."
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'read', 'replied', 'archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === f ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8 text-slate-400 text-sm">Loading messages...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Inbox className="w-8 h-8" />} title="No messages" description="When visitors submit the contact form, their messages will appear here." />
      ) : (
        <>
          <div className="space-y-2">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all hover:bg-white/[0.04] ${
                  msg.status === 'new' ? 'border-indigo-500/20 bg-indigo-500/[0.03]' : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.status === 'new' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-400'
                }`}>
                  {msg.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${msg.status === 'new' ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                      {msg.name}
                    </p>
                    {msg.status === 'new' && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-rose-500" />}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{msg.subject}</p>
                </div>
                <span className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[msg.status]}`}>
                  {STATUS_LABELS[msg.status]}
                </span>
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-3 text-xs disabled:opacity-30">
              Previous
            </button>
            <span className="text-xs text-slate-500">Page {page + 1}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={messages.length < PAGE_SIZE} className="btn-secondary !py-2 !px-3 text-xs disabled:opacity-30">
              Next
            </button>
          </div>
        </>
      )}

      {/* Message detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Message Details"
        size="lg"
        footer={
          selected && (
            <>
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="btn-primary"
              >
                <Reply className="w-4 h-4" /> Reply via Email
              </a>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[selected.status]}`}>
                {STATUS_LABELS[selected.status]}
              </span>
              <span className="text-xs text-slate-500">{new Date(selected.created_at).toLocaleString()}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="label-field">From</p>
                <p className="text-sm text-slate-200">{selected.name}</p>
              </div>
              <div>
                <p className="label-field">Email</p>
                <a href={`mailto:${selected.email}`} className="text-sm text-indigo-400 hover:underline">{selected.email}</a>
              </div>
              <div className="sm:col-span-2">
                <p className="label-field">Subject</p>
                <p className="text-sm text-slate-200">{selected.subject}</p>
              </div>
            </div>
            <div>
              <p className="label-field">Message</p>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
              {selected.status !== 'read' && (
                <button onClick={() => updateStatus(selected, 'read')} className="btn-secondary !py-2 !px-3 text-xs">
                  <MailOpen className="w-3.5 h-3.5" /> Mark Read
                </button>
              )}
              {selected.status !== 'new' && (
                <button onClick={() => updateStatus(selected, 'new')} className="btn-secondary !py-2 !px-3 text-xs">
                  <Mail className="w-3.5 h-3.5" /> Mark Unread
                </button>
              )}
              <button onClick={() => updateStatus(selected, 'replied')} className="btn-secondary !py-2 !px-3 text-xs">
                <Reply className="w-3.5 h-3.5" /> Mark Replied
              </button>
              <button onClick={() => updateStatus(selected, 'archived')} className="btn-secondary !py-2 !px-3 text-xs">
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
              <div className="flex-1" />
              <button onClick={() => setDeleteTarget(selected)} className="btn-danger !py-2 !px-3 text-xs">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Message"
        message={`Delete the message from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

