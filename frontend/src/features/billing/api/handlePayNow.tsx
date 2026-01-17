import { client } from "@shared/lib/client";

export const handlePayNow = async (
    invoiceId: string,
  setPayError: (error: string | null) => void,
  setPayLoading: (loading: boolean) => void
) => {
  try {
    setPayError(null);
    setPayLoading(true);
    const res = await client.post(`/api/v1/billing/pay/${invoiceId}`);
    if (res.data.url) {
      window.location.href = res.data.url;
    } else {
      throw new Error(res.data.error || "No checkout URL returned");
    }
  } catch (err: any) {
    setPayError(err?.response?.data?.error || err?.message || "Unexpected error during payment");
  } finally {
    setPayLoading(false);
  }
};
