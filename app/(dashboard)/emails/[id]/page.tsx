"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { BroadcastProgress, BroadcastStatusBadge } from "@/components/emails/broadcast-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBroadcast } from "@/hooks/use-broadcasts";
import { formatDateTime } from "@/lib/utils";

const RECIPIENT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Waiting", cls: "bg-gray-100 text-gray-800 border-gray-200" },
  SENT: { label: "Sent", cls: "bg-green-100 text-green-800 border-green-200" },
  RETRY: { label: "Retrying", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-800 border-red-200" },
};

export default function BroadcastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("");

  const query: Record<string, string> = { page: String(page), limit: String(limit) };
  if (status) query.status = status;
  const { data, isLoading } = useBroadcast(id, query);

  if (isLoading && !data) return <LoadingPage />;
  if (!data?.broadcast) return <div className="text-center py-12">Broadcast not found</div>;

  const { broadcast, recipients = [] } = data;
  const pagination = data.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/emails" aria-label="Back to broadcasts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold break-words">{broadcast.subject}</h1>
          <p className="text-muted-foreground">
            Started {formatDateTime(broadcast.createdAt)}
            {broadcast.completedAt && <> · finished {formatDateTime(broadcast.completedAt)}</>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Progress</CardTitle>
            <BroadcastStatusBadge broadcast={broadcast} />
          </CardHeader>
          <CardContent className="space-y-4">
            <BroadcastProgress broadcast={broadcast} />
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Recipients", broadcast.total],
                ["Sent", broadcast.sent],
                ["Waiting", broadcast.pending],
                ["Retrying", broadcast.retrying],
                ["Failed", broadcast.failed],
              ].map(([label, n]) => (
                <div key={label} className="rounded-md bg-muted px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{Number(n).toLocaleString()}</dd>
                </div>
              ))}
            </dl>
            {broadcast.status === "RUNNING" && (
              <p className="text-xs text-muted-foreground">
                Sending 10 at a time. This page updates on its own. Temporary failures are retried up to 4 times.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto rounded-md border bg-muted/40 p-4 text-sm whitespace-pre-wrap break-words">
              {broadcast.content || <span className="text-muted-foreground">No content returned.</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Recipients</CardTitle>
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setStatus(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.entries(RECIPIENT_STATUS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <EmptyState title="No recipients" description="No recipients match this filter." />
          ) : (
            <>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipients.map((r) => {
                      const s = RECIPIENT_STATUS[r.status] || { label: r.status, cls: "" };
                      return (
                        <TableRow key={r.userId}>
                          <TableCell>
                            <p className="font-medium">{r.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{r.email}</p>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
                              {s.label}
                            </span>
                          </TableCell>
                          <TableCell className="tabular-nums">{r.attempts}</TableCell>
                          <TableCell className="max-w-[360px] text-xs text-muted-foreground">
                            {r.status === "SENT" && r.sentAt && <>Sent {formatDateTime(r.sentAt)}</>}
                            {r.status === "RETRY" && r.nextAttemptAt && <>Next try {formatDateTime(r.nextAttemptAt)}. </>}
                            {r.lastError && r.status !== "SENT" && (
                              <span className="break-words text-red-700 dark:text-red-400">{r.lastError}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
