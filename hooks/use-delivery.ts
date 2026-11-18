import useSWR from "swr";
import apiClient from "@/lib/api-client";
import type {
  DeliverySettings,
  DeliveryZone,
  DeliveryZoneDto,
  UpdateDeliverySettingsDto,
} from "@/types";

export interface AdminDeliveryData {
  settings: DeliverySettings;
  zones: DeliveryZone[];
}

const KEY = "/admin/settings/delivery";

export function useDeliverySettings() {
  return useSWR<AdminDeliveryData>(KEY, (url: string) =>
    apiClient.get(url).then((res) => res.data.data)
  );
}

export async function updateDeliverySettings(dto: UpdateDeliverySettingsDto) {
  const res = await apiClient.patch(KEY, dto);
  return res.data.data.settings as DeliverySettings;
}

export async function createDeliveryZone(dto: DeliveryZoneDto) {
  const res = await apiClient.post("/admin/delivery-zones", dto);
  return res.data.data.zone as DeliveryZone;
}

export async function updateDeliveryZone(id: string, dto: Partial<DeliveryZoneDto>) {
  const res = await apiClient.patch(`/admin/delivery-zones/${id}`, dto);
  return res.data.data.zone as DeliveryZone;
}

export async function deleteDeliveryZone(id: string) {
  await apiClient.delete(`/admin/delivery-zones/${id}`);
}
