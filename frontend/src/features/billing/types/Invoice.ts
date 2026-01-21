export type Invoice = {
  invoiceId: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalCPU: number;
  totalRAM: number;
  totalSTORAGE: number;
  subtotal: number;
  taxes: number;
  total: number;
  totalPaid: number;
};
