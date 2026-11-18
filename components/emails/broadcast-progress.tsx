import type { EmailBroadcast } from "@/types";

export function BroadcastStatusBadge({ broadcast }: { broadcast: EmailBroadcast }) {
  const running = broadcast.status === "RUNNING";
  const withFailures = !running && broadcast.failed > 0;
  const cls = running
    ? "bg-blue-100 text-blue-800 border-blue-200"
    : withFailures
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-green-100 text-green-800 border-green-200";
  const label = running ? "Sending" : withFailures ? "Completed with failures" : broadcast.status === "COMPLETED" ? "Completed" : broadcast.status;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {running && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {label}
    </span>
  );
}

export function BroadcastProgress({ broadcast, compact = false }: { broadcast: EmailBroadcast; compact?: boolean }) {
  const { total, sent, failed, retrying, pending } = broadcast;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  return (
    <div className="space-y-1.5">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={sent}>
        <div className="bg-green-600" style={{ width: `${pct(sent)}%` }} />
        <div className="bg-amber-500" style={{ width: `${pct(retrying)}%` }} />
        <div className="bg-red-600" style={{ width: `${pct(failed)}%` }} />
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">
        {sent.toLocaleString()} / {total.toLocaleString()} sent
        {!compact && pending > 0 && <> · {pending.toLocaleString()} waiting</>}
        {retrying > 0 && <> · {retrying.toLocaleString()} retrying</>}
        {failed > 0 && <span className="text-red-700 dark:text-red-400"> · {failed.toLocaleString()} failed</span>}
      </p>
    </div>
  );
}
