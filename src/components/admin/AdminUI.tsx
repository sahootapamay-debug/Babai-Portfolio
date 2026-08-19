import type { ReactNode } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface SaveButtonProps {
  onSave: () => void;
  saving: boolean;
  label?: string;
  disabled?: boolean;
}

export function SaveButton({ onSave, saving, label = 'Save Changes', disabled }: SaveButtonProps) {
  return (
    <button onClick={onSave} disabled={saving || disabled} className="btn-primary">
      {saving ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
      ) : (
        <><Save className="w-4 h-4" /> {label}</>
      )}
    </button>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/[0.02] p-6 ${className}`}>
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-white/5 p-4 text-slate-500">{icon}</div>
      <h3 className="text-base font-semibold text-slate-300">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface StatusBadgeProps {
  visible: boolean;
}

export function StatusBadge({ visible }: StatusBadgeProps) {
  return visible ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Visible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Hidden
    </span>
  );
}
