"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BroadcastProgress, BroadcastStatusBadge } from "@/components/emails/broadcast-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBroadcasts, createBroadcast } from "@/hooks/use-broadcasts";
import { getErrorMessage, type ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

export default function EmailsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data, isLoading, mutate } = useBroadcasts({ page: String(page), limit: String(limit) });

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const subjectError =
    subject && (subject.trim().length < 3 || subject.length > 150 || /[\r\n]/.test(subject))
      ? "3–150 characters, one line"
      : null;
  const contentError =
    content && (content.trim().length < 10 || content.length > 10000) ? "10–10,000 characters" : null;
  const canSend = subject.trim().length >= 3 && content.trim().length >= 10 && !subjectError && !contentError;

  const running = data?.broadcasts?.find((b) => b.status === "RUNNING");

  const send = async () => {
    setConfirmOpen(false);
    setSending(true);
    try {
      const res = await createBroadcast({ subject: subject.trim(), content });
      toast.success(res.message || "Broadcast queued");
      setSubject("");
      setContent("");
      await mutate();
      const id = res.data?.broadcast?.id;
      if (id) router.push(`/emails/${id}`);
    } catch (err) {
      const e = err as ApiError & { errors?: { broadcastId?: string } };
      if (e.code === "BROADCAST_IN_PROGRESS" && e.errors?.broadcastId) {
        toast.error("Another broadcast is still sending. Wait for it to finish.", {
          action: { label: "View", onClick: () => router.push(`/emails/${e.errors!.broadcastId}`) },
        });
      } else if (e.code === "DUPLICATE_BROADCAST") {
        toast.error("This exact email was already sent in the last 24 hours.");
      } else if (e.code === "NO_RECIPIENTS") {
        toast.error("No active customer has a verified email yet.");
      } else if (e.code === "EMAIL_DISABLED") {
        toast.error("Email sending is turned off on the server.");
      } else if (e.status === 429) {
        toast.error("Limit reached: at most 5 broadcasts per hour.");
      } else {
        toast.error(getErrorMessage(err, "Could not send broadcast"));
      }
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  const broadcasts = data?.broadcasts || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email broadcasts"
        description="Send one email to every active customer with a verified email."
      />

      <Card>
        <CardHeader>
          <CardTitle>New broadcast</CardTitle>
          <CardDescription>
            Plain text only. The branded layout, a “Hi {"{name}"},” greeting and the footer are added for you.
            It ignores the customer&apos;s email-promotions opt-out, so don&apos;t use it for marketing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              maxLength={150}
              placeholder="Weekend sale"
              value={subject}
              onChange={(e) => setSubject(e.target.value.replace(/[\r\n]/g, " "))}
            />
            <div className="flex justify-between text-xs">
              <span className="text-destructive">{subjectError}</span>
              <span className="text-muted-foreground tabular-nums">{subject.length}/150</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              rows={8}
              maxLength={10000}
              placeholder={"Hello!\n\nAll reds are 10% off this weekend.\nSee you soon."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {contentError ? (
                  <span className="text-destructive">{contentError}</span>
                ) : (
                  "A blank line starts a new paragraph. HTML shows as plain text."
                )}
              </span>
              <span className="text-muted-foreground tabular-nums">{content.length.toLocaleString()}/10,000</span>
            </div>
          </div>
          {running && (
            <p className="rounded-md border bg-muted px-3 py-2 text-sm">
              “{running.subject}” is still sending ({running.sent}/{running.total}).{" "}
              <Link href={`/emails/${running.id}`} className="text-gold-700 hover:underline">
                View progress
              </Link>
            </p>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setConfirmOpen(true)} disabled={!canSend || sending || !!running}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send to all customers
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {broadcasts.length === 0 ? (
            <EmptyState
              icon={<Mail className="h-6 w-6 text-muted-foreground" />}
              title="No broadcasts yet"
              description="Emails you send to all customers will show up here."
            />
          ) : (
            <>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-[200px]">Progress</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {broadcasts.map((b) => (
                      <TableRow key={b.id} className="cursor-pointer" onClick={() => router.push(`/emails/${b.id}`)}>
                        <TableCell className="font-medium">
                          <Link href={`/emails/${b.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                            {b.subject}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <BroadcastStatusBadge broadcast={b} />
                        </TableCell>
                        <TableCell>
                          <BroadcastProgress broadcast={b} compact />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDateTime(b.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Send to every customer?"
        description={`“${subject.trim()}” goes to every active customer with a verified email. A sent broadcast can't be recalled.`}
        confirmLabel="Send now"
        onConfirm={send}
      />
    </div>
  );
}
