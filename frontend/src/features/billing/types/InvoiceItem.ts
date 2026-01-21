export type InvoiceItem = {
  itemId: string;
  invoiceId: string;
  projectId: string;
  description: string;
  pricingModel: string;
  metric: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};
