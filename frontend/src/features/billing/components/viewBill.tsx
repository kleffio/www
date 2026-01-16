import { useState } from 'react';
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";
import { handlePayNow } from "@features/billing/api/handlePayNow";

interface ViewBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  projectId: string;
  status: string;
}

export function ViewBillModal({ isOpen, onClose, invoiceId, projectId, status }: ViewBillModalProps) {
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handlePay = () => {
    handlePayNow(projectId, invoiceId, setPayError, setPayLoading);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold text-neutral-50 mb-4">Bill Details</h2>
        {/* Placeholder for bill details - add content as needed */}
        <p className="text-sm text-neutral-400 mb-4">Invoice ID: {invoiceId}</p>
        {payError && <p className="text-sm text-red-400 mb-4">{payError}</p>}
        <div className="flex gap-3">
          {status.toLowerCase() !== 'paid' && (
            <Button
              onClick={handlePay}
              disabled={payLoading}
              className="bg-gradient-kleff rounded-full px-4 py-2 text-sm font-semibold text-black"
            >
              {payLoading ? <Spinner /> : 'Pay Now'}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className="rounded-full px-4 py-2 text-sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
