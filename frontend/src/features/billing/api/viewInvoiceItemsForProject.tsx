import { client } from "@shared/lib/client";
import type { InvoiceItem } from "@features/billing/types/InvoiceItem";

export default async function fetchInvoiceItems(projectId: string): Promise<InvoiceItem> {
  try {
    const res = await client.get<InvoiceItem>(`/api/v1/billing/${projectId}/invoice-items/`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}
