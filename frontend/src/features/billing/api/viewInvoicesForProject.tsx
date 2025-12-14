import { client } from "@shared/lib/client";
import type { Invoice } from "@features/billing/types/Invoice";

export default async function fetchInvoice(projectId: string): Promise<Invoice> {
  try {
    const res = await client.get<Invoice>(`/api/v1/billing/${projectId}/invoices/`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}
