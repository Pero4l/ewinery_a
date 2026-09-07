export interface DashboardStats {
  totalUsers?: number;
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  pendingOrders?: number;
  activeProducts?: number;
  newUsersToday?: number;
  ordersToday?: number;
  [key: string]: unknown;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  sku?: string;
  isAvailable: boolean;
}
