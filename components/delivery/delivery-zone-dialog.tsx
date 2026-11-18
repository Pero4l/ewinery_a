"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createDeliveryZone, updateDeliveryZone } from "@/hooks/use-delivery";
import { getErrorMessage, type ApiError } from "@/lib/api-client";
import type { DeliveryZone, DeliveryZoneDto } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: DeliveryZone;
  onSaved: () => void;
}

const empty = {
  name: "",
  state: "",
  cities: "",
  fee: "",
  freeDeliveryThreshold: "",
  estimatedDeliveryText: "",
  isActive: true,
  sortOrder: "0",
};

function parseCities(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,\n]/)) {
    const c = part.trim();
    if (c && !seen.has(c.toLowerCase())) {
      seen.add(c.toLowerCase());
      out.push(c);
    }
  }
  return out;
}

const isNaira = (n: number) => Number.isInteger(n) && n >= 0 && n <= 1_000_000;

function initialForm(zone?: DeliveryZone) {
  if (!zone) return empty;
  return {
    name: zone.name,
    state: zone.state,
    cities: zone.cities.join(", "),
    fee: String(zone.fee),
    freeDeliveryThreshold: zone.freeDeliveryThreshold == null ? "" : String(zone.freeDeliveryThreshold),
    estimatedDeliveryText: zone.estimatedDeliveryText ?? "",
    isActive: zone.isActive,
    sortOrder: String(zone.sortOrder ?? 0),
  };
}

export function DeliveryZoneDialog({ open, onOpenChange, zone, onSaved }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        {/* DialogContent unmounts when closed, so the form starts fresh on every open. */}
        <ZoneForm key={zone?.id ?? "new"} zone={zone} onOpenChange={onOpenChange} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  );
}

function ZoneForm({ zone, onOpenChange, onSaved }: Omit<Props, "open">) {
  const [form, setForm] = useState(() => initialForm(zone));
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflict(null);
    const fee = Number(form.fee);
    const threshold = form.freeDeliveryThreshold.trim() === "" ? null : Number(form.freeDeliveryThreshold);
    const cities = parseCities(form.cities);

    if (!form.name.trim() || !form.state.trim()) return toast.error("Name and state are required");
    if (form.fee.trim() === "" || !isNaira(fee)) return toast.error("Fee must be a whole number between 0 and 1,000,000");
    if (threshold !== null && !isNaira(threshold))
      return toast.error("Free delivery threshold must be a whole number between 0 and 1,000,000, or empty");
    if (cities.length > 200) return toast.error("A zone can list at most 200 cities");

    const dto: DeliveryZoneDto = {
      name: form.name.trim(),
      state: form.state.trim(),
      cities,
      fee,
      freeDeliveryThreshold: threshold,
      estimatedDeliveryText: form.estimatedDeliveryText.trim() || null,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);
    try {
      if (zone) await updateDeliveryZone(zone.id, dto);
      else await createDeliveryZone(dto);
      toast.success(zone ? "Zone updated" : "Zone created");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Could not save zone");
      if ((err as ApiError).code === "DELIVERY_ZONE_CONFLICT") setConflict(msg);
      else toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const cityCount = parseCities(form.cities).length;

  return (
    <>
        <DialogHeader>
          <DialogTitle>{zone ? "Edit zone" : "Add zone"}</DialogTitle>
          <DialogDescription>
            Leave cities empty to cover the whole state. Among active zones in a state, each city can be in only one zone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="z-name">Name</Label>
              <Input id="z-name" placeholder="Lagos Island" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="z-state">State</Label>
              <Input id="z-state" placeholder="Lagos" value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="z-cities">
              Cities <span className="font-normal text-muted-foreground">({cityCount === 0 ? "whole state" : cityCount})</span>
            </Label>
            <Textarea
              id="z-cities"
              rows={2}
              placeholder="Lekki, Victoria Island, Ikoyi"
              value={form.cities}
              onChange={(e) => set("cities", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Separate with commas or new lines.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="z-fee">Fee (₦)</Label>
              <Input id="z-fee" type="number" min={0} max={1000000} step={1} value={form.fee} onChange={(e) => set("fee", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="z-free">Free delivery from (₦)</Label>
              <Input
                id="z-free"
                type="number"
                min={0}
                max={1000000}
                step={1}
                placeholder="Use global"
                value={form.freeDeliveryThreshold}
                onChange={(e) => set("freeDeliveryThreshold", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="space-y-2">
              <Label htmlFor="z-eta">Estimated delivery</Label>
              <Input id="z-eta" placeholder="Same day" value={form.estimatedDeliveryText} onChange={(e) => set("estimatedDeliveryText", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="z-sort">Sort order</Label>
              <Input id="z-sort" type="number" step={1} value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="z-active" checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
            <Label htmlFor="z-active">Active</Label>
          </div>
          {conflict && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {conflict}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {zone ? "Save" : "Create zone"}
            </Button>
          </DialogFooter>
        </form>
    </>
  );
}
