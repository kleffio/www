import { client } from "@shared/lib/client";

export const handlePayNow = async (
  projectId : string,
    invoiceId: string,
  setPayError: (error: string | null) => void,
  setPayLoading: (loading: boolean) => void
) => {
  try {
    setPayError(null);
    setPayLoading(true);
    const res = await client.post(`/api/v1/billing/pay/${projectId}/`, { invoiceId });
    if (res.data.checkoutUrl) {
      window.location.href = res.data.checkoutUrl;
    } else {
      throw new Error(res.data.message || "No checkout URL returned");
    }
  } catch (err: any) {
    setPayError(err?.message || "Unexpected error during payment");
  } finally {
    setPayLoading(false);
  }
};
