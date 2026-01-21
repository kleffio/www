import { client } from "@shared/lib/client";
import type { Price } from "../types/Price";

export default async function fetchPrices(): Promise<Price[]> {
  const res = await client.get<Price[]>(`/api/v1/billing/prices`);
  return res.data;
}
