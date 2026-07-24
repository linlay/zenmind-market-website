import { AlertCircle, AlertOctagon, CheckCircle2, Info } from 'lucide-react';

export function StateNotice({ title, body, tone = 'neutral' }: { title: string; body: string; tone?: string }) {
  const NoticeIcon = tone === 'warning' || tone === 'error' ? AlertCircle : Info;
  return (
    <div className={`state-notice is-${tone}`}>
      <NoticeIcon size={16} />
      <span><strong>{title}</strong>{body}</span>
    </div>
  );
}

export function Toast({ toast }: { toast: { tone: string; message: string } }) {
  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertOctagon : Info;
  return (
    <div className={`toast is-${toast.tone}`}>
      <Icon size={17} />
      <span>{toast.message}</span>
    </div>
  );
}
