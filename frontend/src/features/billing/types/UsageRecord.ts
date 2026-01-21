export type UsageRecord = {
  usageId: string;
  projectId: string;
  containerId: string;
  pricingModel: string;
  metric: string;
  quantity: number;
  recordedAt: Date;
};
