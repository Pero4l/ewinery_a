"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorMessage } from "@/components/shared/error-message";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DeliveryZoneDialog } from "@/components/delivery/delivery-zone-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeliverySettings,
  updateDeliverySettings,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "@/hooks/use-delivery";
import { getErrorMessage } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { DeliverySettings, DeliveryZone } from "@/types";

function parseNaira(value: string): number | null | "invalid" {
  const v = value.trim();
  if (v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) return "invalid";
  return n;
}

export default function DeliveryPage() {
  const { data, error, isLoading, mutate } = useDeliverySettings();

  const [toggling, setToggling] = useState(false);

  const [zoneDialog, setZoneDialog] = useState<{ open: boolean; zone?: DeliveryZone }>({ open: false });
  const [deleteZone, setDeleteZone] = useState<DeliveryZone | null>(null);
  const [busyZone, setBusyZone] = useState<string | null>(null);

  if (isLoading) return <LoadingPage />;
  if (error || !data) {
    return <ErrorMessage message={getErrorMessage(error, "Could not load delivery settings.")} />;
  }

  const zones = [...(data.zones || [])].sort(
    (a, b) => a.state.localeCompare(b.state) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
  );

  const toggleDelivery = async (enabled: boolean) => {
    setToggling(true);
    try {
      await updateDeliverySettings({ isDeliveryEnabled: enabled });
      await mutate();
      toast.success(enabled ? "Delivery resumed" : "Delivery paused. New orders are refused until you resume it.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update delivery"));
    } finally {
      setToggling(false);
    }
  };

  const toggleZone = async (zone: DeliveryZone, isActive: boolean) => {
    setBusyZone(zone.id);
    try {
      await updateDeliveryZone(zone.id, { isActive });
      await mutate();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update zone"));
    } finally {
      setBusyZone(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteZone) return;
    try {
      await deleteDeliveryZone(deleteZone.id);
      await mutate();
      toast.success(`Deleted "${deleteZone.name}"`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete zone"));
    } finally {
      setDeleteZone(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery"
        description="Delivery fees for the cart, checkout and guest orders. Past orders keep the fee they were charged."
      />

      <Card className={data.settings.isDeliveryEnabled ? "" : "border-destructive/50"}>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">
              {data.settings.isDeliveryEnabled ? "Delivery is on" : "Delivery is paused"}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.settings.isDeliveryEnabled
                ? "Customers can place orders."
                : "New orders and guest orders are refused (DELIVERY_UNAVAILABLE) until you turn delivery back on."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
            <Switch
              checked={data.settings.isDeliveryEnabled}
              onCheckedChange={toggleDelivery}
              disabled={toggling}
              aria-label="Delivery enabled"
            />
          </div>
        </CardContent>
      </Card>

      <PricingForm
        key={data.settings.updatedAt ?? "settings"}
        settings={data.settings}
        onSaved={() => mutate()}
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Zones</CardTitle>
            <CardDescription className="mt-1.5">
              A city zone wins over a whole-state zone, which wins over the default fee. Matching ignores case.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setZoneDialog({ open: true })}>
            <Plus className="mr-1 h-4 w-4" />
            Add zone
          </Button>
        </CardHeader>
        <CardContent>
          {zones.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-6 w-6 text-muted-foreground" />}
              title="No zones yet"
              description={`Every address pays the default fee of ${formatCurrency(data.settings.defaultFee)}.`}
            />
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Cities</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="text-right">Free from</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-[96px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone) => (
                    <TableRow key={zone.id} className={zone.isActive ? "" : "opacity-60"}>
                      <TableCell>
                        <p className="font-medium">{zone.name}</p>
                        {zone.estimatedDeliveryText && (
                          <p className="text-xs text-muted-foreground">{zone.estimatedDeliveryText}</p>
                        )}
                      </TableCell>
                      <TableCell>{zone.state}</TableCell>
                      <TableCell className="max-w-[260px]">
                        {zone.cities.length === 0 ? (
                          <span className="text-muted-foreground italic">Whole state</span>
                        ) : (
                          <span className="line-clamp-2" title={zone.cities.join(", ")}>
                            {zone.cities.join(", ")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(zone.fee)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {zone.freeDeliveryThreshold == null ? (
                          <span className="text-muted-foreground">
                            {data.settings.freeDeliveryThreshold == null
                              ? "Never"
                              : `${formatCurrency(data.settings.freeDeliveryThreshold)} (global)`}
                          </span>
                        ) : (
                          formatCurrency(zone.freeDeliveryThreshold)
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={zone.isActive}
                          disabled={busyZone === zone.id}
                          onCheckedChange={(v) => toggleZone(zone, v)}
                          aria-label={`${zone.name} active`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setZoneDialog({ open: true, zone })}
                            aria-label={`Edit ${zone.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteZone(zone)}
                            aria-label={`Delete ${zone.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DeliveryZoneDialog
        open={zoneDialog.open}
        zone={zoneDialog.zone}
        onOpenChange={(open) => setZoneDialog((s) => ({ ...s, open }))}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={!!deleteZone}
        onOpenChange={(open) => !open && setDeleteZone(null)}
        title="Delete zone?"
        description={
          deleteZone
            ? `"${deleteZone.name}" will be removed. Addresses it covered will fall back to a whole-state zone or the default fee. Past orders are not affected.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function PricingForm({ settings, onSaved }: { settings: DeliverySettings; onSaved: () => Promise<unknown> }) {
  const initial = {
    fee: String(settings.defaultFee ?? ""),
    threshold: settings.freeDeliveryThreshold == null ? "" : String(settings.freeDeliveryThreshold),
    eta: settings.estimatedDeliveryText ?? "",
  };
  const [defaultFee, setDefaultFee] = useState(initial.fee);
  const [threshold, setThreshold] = useState(initial.threshold);
  const [eta, setEta] = useState(initial.eta);
  const [saving, setSaving] = useState(false);

  const dirty = defaultFee !== initial.fee || threshold !== initial.threshold || eta !== initial.eta;

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseNaira(defaultFee);
    const free = parseNaira(threshold);
    if (fee === null || fee === "invalid") {
      toast.error("Default fee must be a whole number between 0 and 1,000,000");
      return;
    }
    if (free === "invalid") {
      toast.error("Free delivery threshold must be a whole number between 0 and 1,000,000, or empty");
      return;
    }
    setSaving(true);
    try {
      await updateDeliverySettings({
        defaultFee: fee,
        freeDeliveryThreshold: free,
        estimatedDeliveryText: eta.trim() || null,
      });
      await onSaved();
      toast.success("Delivery settings saved");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save delivery settings"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default pricing</CardTitle>
        <CardDescription>
          Used when an address matches no active zone. Zones can override the free-delivery threshold.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={saveSettings} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="defaultFee">Default fee (₦)</Label>
            <Input
              id="defaultFee"
              type="number"
              min={0}
              max={1000000}
              step={1}
              value={defaultFee}
              onChange={(e) => setDefaultFee(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Free delivery from (₦)</Label>
            <Input
              id="threshold"
              type="number"
              min={0}
              max={1000000}
              step={1}
              placeholder="Never free"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty to never offer free delivery.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eta">Estimated delivery</Label>
            <Input
              id="eta"
              placeholder="1–3 working days"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" disabled={saving || !dirty}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save pricing
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
