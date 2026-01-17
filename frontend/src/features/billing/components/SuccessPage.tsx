import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verified] = useState(false);

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Invoice #{invoiceId} has been paid.</p>
      <p>Session ID: {sessionId}</p>
      {verified && <p>Payment verified ✓</p>}
      <a href={`/invoices/${invoiceId}`}>View Invoice</a>
    </div>
  );
};

export default PaymentSuccessPage;