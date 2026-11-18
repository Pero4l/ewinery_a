export interface DeliverySettings {
  isDeliveryEnabled: boolean;
  defaultFee: number;
  /** null = delivery is never free */
  freeDeliveryThreshold: number | null;
  estimatedDeliveryText: string | null;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  state: string;
  /** [] = the whole state */
  cities: string[];
  fee: number;
  /** null = use the global threshold */
  freeDeliveryThreshold: number | null;
  estimatedDeliveryText: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateDeliverySettingsDto = Partial<
  Pick<DeliverySettings, "isDeliveryEnabled" | "defaultFee" | "freeDeliveryThreshold" | "estimatedDeliveryText">
>;

export type DeliveryZoneDto = Omit<DeliveryZone, "id" | "createdAt" | "updatedAt">;
