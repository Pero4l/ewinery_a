export type CouponStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "INACTIVE" | "REDEEMED";

export type CouponAssignmentStatus = "REDEEMED" | "UNREDEEMED";

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  amount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  usedCount?: number;
  assignedCount?: number;
}

export interface CreateCouponDto {
  code: string;
  name: string;
  description?: string;
  amount: number;
  startsAt: string;
  expiresAt: string;
}

export interface UpdateCouponDto {
  name?: string;
  description?: string;
  amount?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface CouponAssignment {
  id: string;
  couponId?: string;
  userId?: string;
  redeemedAt: string | null;
  status: CouponAssignmentStatus;
  assignedAt?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
}

export interface AssignCouponDto {
  userIds: string[];
}

export interface RevokeCouponDto {
  userIds: string[];
}