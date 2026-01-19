import { client } from '@shared/lib/client';
import { useState } from 'react';

interface PaymentResponse {
  url: string;
  sessionId: string;
}

const InvoicePayment = ({ invoiceId }: { invoiceId: string }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.post<PaymentResponse>(
        `/api/v1/billing/pay/${invoiceId}`
      );

      // Redirect to Stripe
      window.location.href = data.url;
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handlePayInvoice} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Invoice'}
      </button>
    </div>
  );
};

export default InvoicePayment;