import { Button } from "@shared/ui/Button";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { MiniCard } from "@shared/ui/MiniCard";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { DollarSign, Calendar, Badge } from "lucide-react";
import { useState, Activity } from "react";
import type { Invoice } from "../types/Invoice";
export const BillingPanel = ({ data }: { data: Invoice }) => {
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  
  return (
    <SoftPanel>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GradientIcon icon={DollarSign} />
          <h2 className="text-lg font-semibold text-neutral-50">Invoice #{data.invoiceId}</h2>
        </div>
        <Button
          size="sm"
          onClick={() => setIsBillingModalOpen(true)}
          className="rounded-full px-4 py-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
        >
          View Details
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniCard title="Total Amount">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-lg font-semibold text-neutral-50">${data.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Total charges</p>
        </MiniCard>
        <MiniCard title="Billing Period">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-200">
              {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Invoice period</p>
        </MiniCard>
        <MiniCard title="Subtotal & Taxes">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-200">${data.subtotal.toFixed(2)} + ${data.taxes.toFixed(2)}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Breakdown</p>
        </MiniCard>
        <MiniCard title="Status">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              data.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
              data.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-red-500/20 text-red-400'
            }`}>
              {data.status}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Payment status</p>
        </MiniCard>
      </div>
    </SoftPanel>
  );
};