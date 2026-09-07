"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Send, MessageSquare } from "lucide-react";
import { useTicket, useReplyTicket, useUpdateTicket } from "@/hooks/use-tickets";
import { LoadingPage } from "@/components/shared/loading-page";
import { formatDateTime } from "@/lib/utils";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_COLORS,
} from "@/lib/constants";
import { toast } from "sonner";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: ticket, isLoading, mutate } = useTicket(id);
  const { trigger: replyTicket, isMutating: isReplying } = useReplyTicket(id);
  const { trigger: updateTicket, isMutating: isUpdating } = useUpdateTicket(id);

  const [message, setMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const handleReply = async () => {
    if (!message.trim()) return;
    try {
      await replyTicket({ message, isInternalNote });
      toast.success(isInternalNote ? "Internal note added" : "Reply sent");
      setMessage("");
      setIsInternalNote(false);
      mutate();
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      await updateTicket({ status: newStatus as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" });
      toast.success(`Ticket status updated to ${TICKET_STATUS_LABELS[newStatus]}`);
      setNewStatus("");
      mutate();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!ticket) return <div className="text-center py-12">Ticket not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/support">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <p className="text-muted-foreground">
            Created {formatDateTime(ticket.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TICKET_STATUS_COLORS[ticket.status] || ""}`}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TICKET_PRIORITY_COLORS[ticket.priority] || ""}`}>
            {TICKET_PRIORITY_LABELS[ticket.priority]}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages?.map((msg) => {
                const isAgent = msg.sender?.role === "ADMIN";
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.isInternalNote
                        ? "bg-yellow-50 border border-yellow-200"
                        : isAgent
                        ? "bg-[#722f37]/5 border border-[#722f37]/10 ml-8"
                        : "bg-muted mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        {msg.sender?.fullName || "Unknown"}
                        {msg.isInternalNote && (
                          <span className="ml-2 text-xs text-yellow-600">(Internal Note)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                );
              })}
              {(!ticket.messages || ticket.messages.length === 0) && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No messages yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isInternalNote}
                    onCheckedChange={setIsInternalNote}
                  />
                  <Label className="text-sm">Internal Note</Label>
                </div>
                <Button
                  onClick={handleReply}
                  disabled={!message.trim() || isReplying}
                >
                  {isReplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  {isInternalNote ? "Add Note" : "Send Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || isUpdating}
                className="w-full"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{ticket.user?.fullName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{ticket.user?.email || "-"}</p>
              </div>
              {ticket.orderNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Related Order</p>
                  <p className="font-medium">{ticket.orderNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="font-medium">{ticket.assignedTo?.fullName || "Unassigned"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
