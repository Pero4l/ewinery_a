"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Coupon } from "@/types";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/use-coupons";

const schema = z
  .object({
    code: z
      .string()
      .min(2, "Code must be at least 2 characters")
      .max(30, "Code must be at most 30 characters")
      .regex(/^[a-zA-Z0-9]+$/, "Code must be alphanumeric"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    amount: z
      .number()
      .positive("Amount must be greater than 0")
      .max(1000000, "Amount cannot exceed ₦1,000,000"),
    startsAt: z.string().min(1, "Start date is required"),
    expiresAt: z.string().min(1, "Expiry date is required"),
    isActive: z.boolean(),
  })
  .refine((data) => data.expiresAt > data.startsAt, {
    message: "Expiry must be after the start date",
    path: ["expiresAt"],
  });

type Form = z.infer<typeof schema>;

function toDateTimeLocal(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toIso(value: string): string {
  return value ? new Date(value).toISOString() : "";
}

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon;
  onSuccess: () => void;
}

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: CouponFormDialogProps) {
  const { trigger: createCoupon, isMutating: isCreating } = useCreateCoupon();
  const { trigger: updateCoupon, isMutating: isUpdating } = useUpdateCoupon(
    coupon?.id || ""
  );
  const isMutating = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      amount: 0,
      startsAt: "",
      expiresAt: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open && coupon) {
      reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || "",
        amount: coupon.amount,
        startsAt: toDateTimeLocal(coupon.startsAt),
        expiresAt: toDateTimeLocal(coupon.expiresAt),
        isActive: coupon.isActive,
      });
    } else if (open) {
      reset({
        code: "",
        name: "",
        description: "",
        amount: 0,
        startsAt: "",
        expiresAt: "",
        isActive: true,
      });
    }
  }, [open, coupon, reset]);

  const onSubmit = async (data: Form) => {
    try {
      const payload = {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || undefined,
        amount: data.amount,
        startsAt: toIso(data.startsAt),
        expiresAt: toIso(data.expiresAt),
        ...(coupon ? { isActive: data.isActive } : {}),
      };
      if (coupon) {
        await updateCoupon(payload);
        toast.success("Coupon updated");
      } else {
        await createCoupon(payload);
        toast.success("Coupon created");
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon" : "Create Coupon"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="WELCOME1000"
                disabled={!!coupon}
                {...register("code")}
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                max={1000000}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="New customer welcome" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="₦1,000 off your first order"
              rows={3}
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Starts At</Label>
              <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
              {errors.startsAt && (
                <p className="text-sm text-destructive">
                  {errors.startsAt.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input id="expiresAt" type="datetime-local" {...register("expiresAt")} />
              {errors.expiresAt && (
                <p className="text-sm text-destructive">
                  {errors.expiresAt.message}
                </p>
              )}
            </div>
          </div>
          {coupon && (
            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
              <Label>Active</Label>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {coupon ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}