import type { Invoice } from "@features/billing/types/Invoice";
import { client } from "@shared/lib/client";

export async function fetchInvoice2(projectId: string): Promise<Invoice[]> {
  try {
    const res = await client.get<Invoice[]>(`/api/v1/billing/${projectId}/invoices/`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}


export default async function fetchInvoice(): Promise<Invoice[]> {
return [
  {
    invoiceId: "INV-0001",
    projectId: "WEB-4532",
    startDate: new Date("2024-11-01"),
    endDate: new Date("2024-11-30"),
    amount: 432.50,
    status: "paid",
    subtotal: 382.74,
    taxes: 49.76,
    total: 432.50
  },
  {
    invoiceId: "INV-0002",
    projectId: "API-7821",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-10-31"),
    amount: 678.90,
    status: "paid",
    subtotal: 600.80,
    taxes: 78.10,
    total: 678.90
  },
  {
    invoiceId: "INV-0003",
    projectId: "MOB-2341",
    startDate: new Date("2024-09-01"),
    endDate: new Date("2024-09-30"),
    amount: 234.75,
    status: "pending",
    subtotal: 207.74,
    taxes: 27.01,
    total: 234.75
  },
  {
    invoiceId: "INV-0004",
    projectId: "DATA-5612",
    startDate: new Date("2024-08-01"),
    endDate: new Date("2024-08-31"),
    amount: 891.20,
    status: "overdue",
    subtotal: 788.67,
    taxes: 102.53,
    total: 891.20
  },
  {
    invoiceId: "INV-0005",
    projectId: "ML-8934",
    startDate: new Date("2024-07-01"),
    endDate: new Date("2024-07-31"),
    amount: 567.30,
    status: "paid",
    subtotal: 502.04,
    taxes: 65.26,
    total: 567.30
  },
  {
    invoiceId: "INV-0006",
    projectId: "INFRA-1247",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-30"),
    amount: 345.80,
    status: "paid",
    subtotal: 306.02,
    taxes: 39.78,
    total: 345.80
  },
  {
    invoiceId: "INV-0007",
    projectId: "WEB-6789",
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-05-31"),
    amount: 789.45,
    status: "pending",
    subtotal: 698.63,
    taxes: 90.82,
    total: 789.45
  },
  {
    invoiceId: "INV-0008",
    projectId: "API-3421",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-04-30"),
    amount: 123.90,
    status: "paid",
    subtotal: 109.65,
    taxes: 14.25,
    total: 123.90
  },
  {
    invoiceId: "INV-0009",
    projectId: "MOB-9087",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-31"),
    amount: 456.20,
    status: "overdue",
    subtotal: 403.72,
    taxes: 52.48,
    total: 456.20
  },
  {
    invoiceId: "INV-0010",
    projectId: "DATA-4523",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-02-29"),
    amount: 612.85,
    status: "paid",
    subtotal: 542.35,
    taxes: 70.50,
    total: 612.85
  }
];

}
