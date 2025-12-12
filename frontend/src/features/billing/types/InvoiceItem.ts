export type Invoice = {
  invoiceId: string;
  projectId: string;
  startDate : Date;
  endDate : Date;
  amount: number;
  status: string;
  subtotal : number;
  taxes: number;
  total: number;

}