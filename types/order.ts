import { User } from "./auth";

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: string;
  customerNote?: string;
  adminNote?: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  /** null for guest orders */
  user?: User | null;
  userId?: string | null;
  isGuest?: boolean;
  guestEmail?: string | null;
  /** Snapshot of the delivery address (guest orders also carry email + phone here) */
  shippingAddress?: OrderAddress | null;
  address?: OrderAddress;
  deliveryZoneName?: string | null;
  couponCode?: string | null;
  currency?: string;
  itemCount?: number;
  termsVersion?: string | null;
  termsAcceptedAt?: string | null;
  ageConfirmedAt?: string | null;
  transactionReference?: string;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface OrderAddress {
  recipientName: string;
  email?: string;
  phone?: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  deliveryInstructions?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  note?: string;
}
