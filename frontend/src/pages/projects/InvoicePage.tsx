import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '@shared/lib/client';

interface Invoice {
  invoiceId: string;
  projectId: string;
  status: string;
  total: number;
  totalPaid: number;
}

const InvoicePage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch invoice details
    client.get(`/api/v1/billing/invoice/${invoiceId}`)
      .then(res => setInvoice(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to fetch invoice'));
  }, [invoiceId]);

  const handlePayInvoice = async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.post(`/api/v1/billing/pay/${invoiceId}`);

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process payment');
      setLoading(false);
    }
  };

  if (!invoice) return <div>Loading...</div>;

  const outstandingAmount = invoice.total - invoice.totalPaid;

  return (
    <div>
      <h1>Invoice #{invoice.invoiceId}</h1>
      <p>Project: {invoice.projectId}</p>
      <p>Status: {invoice.status}</p>
      <p>Total: ${invoice.total.toFixed(2)}</p>
      <p>Paid: ${invoice.totalPaid.toFixed(2)}</p>
      <p>Outstanding: ${outstandingAmount.toFixed(2)}</p>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {outstandingAmount > 0 && (
        <button 
          onClick={handlePayInvoice}
          disabled={loading}
        >
          {loading ? 'Redirecting to payment...' : `Pay $${outstandingAmount.toFixed(2)}`}
        </button>
      )}
    </div>
  );
};

export default InvoicePage;