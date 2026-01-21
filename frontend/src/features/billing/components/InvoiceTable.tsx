import { useState, useEffect } from "react";
import { DollarSign, Calendar, X, Eye, Loader2 } from "lucide-react";
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";
import type { Invoice } from "@features/billing/types/Invoice";
import { fetchInvoice } from "../api/viewInvoicesForProject";
import { handlePayNow } from "../api/handlePayNow";
import { usePermissions } from "@features/projects/hooks/usePermissions";

interface InvoiceTableProps {
  projectId: string;
}

export default function InvoiceTable({ projectId }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const { canManageBilling, isLoading: permissionsLoading } = usePermissions(projectId);

  useEffect(() => {
    const loadInvoices = async () => {
      // Don't fetch if user doesn't have permission
      if (!canManageBilling) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchInvoice(projectId);
        setInvoices(data);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading) {
      loadInvoices();
    }
  }, [projectId, canManageBilling, permissionsLoading]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-500/20 text-emerald-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "overdue":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-neutral-500/20 text-neutral-400";
    }
  };

  const handlePay = () => {
    if (selectedInvoice) {
      handlePayNow(selectedInvoice.invoiceId, setPayError, setPayLoading);
    }
  };

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br p-0">
        <div className="mx-auto flex h-96 max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-neutral-400">Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if user doesn't have permission
  if (!canManageBilling) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br p-0">
        <div className="mx-auto flex h-96 max-w-7xl items-center justify-center">
          <div className="max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-center text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-0">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-2">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-50">Invoices</h1>
              <p className="text-sm text-neutral-400">
                {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {invoices.length === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-12 backdrop-blur-sm">
            <div className="text-center">
              <DollarSign className="mx-auto mb-4 h-12 w-12 text-neutral-600" />
              <h3 className="mb-2 text-lg font-medium text-neutral-300">No invoices found</h3>
              <p className="text-sm text-neutral-500">
                There are no invoices for this project yet.
              </p>
            </div>
          </div>
        ) : (
          /* Table Container with dynamic height */
          <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{
                maxHeight: invoices.length > 10 ? "600px" : "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#404040 #171717"
              }}
            >
              <table className="w-full">
                <thead className="sticky top-0 z-10 border-b border-neutral-700 bg-neutral-800/50">
                  <tr>
                    <th className="bg-neutral-800/90 px-6 py-4 text-left text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                      Invoice ID
                    </th>
                    <th className="bg-neutral-800/90 px-6 py-4 text-left text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                      Project
                    </th>
                    <th className="bg-neutral-800/90 px-6 py-4 text-left text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                      Period
                    </th>
                    <th className="bg-neutral-800/90 px-6 py-4 text-left text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                      Total
                    </th>
                    <th className="bg-neutral-800/90 px-6 py-4 text-left text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                      Status
                    </th>
                    <th className="bg-neutral-800/90 px-6 py-4 text-left text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.invoiceId}
                      className="transition-colors hover:bg-neutral-800/30"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-neutral-200">
                          {invoice.invoiceId.slice(0, Math.floor(invoice.invoiceId.length / 2))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-300">
                          {invoice.projectId.slice(0, Math.floor(invoice.projectId.length / 2))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                          <Calendar className="h-4 w-4 text-neutral-500" />
                          <span>
                            {new Date(invoice.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric"
                            })}{" "}
                            -{" "}
                            {new Date(invoice.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-neutral-50">
                          ${invoice.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/30"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-50">
                Invoice Details - #{selectedInvoice.invoiceId}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-neutral-400 transition-colors hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Invoice ID</p>
                  <p className="text-base font-medium text-neutral-200">
                    {selectedInvoice.invoiceId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Project ID</p>
                  <p className="text-base font-medium text-neutral-200">
                    {selectedInvoice.projectId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Billing Period</p>
                  <p className="text-base font-medium text-neutral-200">
                    {new Date(selectedInvoice.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedInvoice.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Status</p>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-6">
                <h4 className="mb-4 text-sm font-semibold text-neutral-400">Payment Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Total CPU</span>
                    <span className="font-medium text-neutral-200">
                      {selectedInvoice.totalCPU.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Total RAM</span>
                    <span className="font-medium text-neutral-200">
                      {selectedInvoice.totalRAM.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Total Storage</span>
                    <span className="font-medium text-neutral-200">
                      {selectedInvoice.totalSTORAGE.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-700 pt-3">
                    <span className="text-neutral-300">Subtotal</span>
                    <span className="font-medium text-neutral-200">
                      ${selectedInvoice.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Taxes</span>
                    <span className="font-medium text-neutral-200">
                      ${selectedInvoice.taxes.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                    <span className="text-lg font-semibold text-neutral-50">Total</span>
                    <span className="text-lg font-bold text-emerald-400">
                      ${selectedInvoice.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {payError && <p className="mt-4 text-sm text-red-400">{payError}</p>}
            <div className="mt-6 flex gap-3">
              {selectedInvoice.status.toLowerCase() !== "paid" && (
                <Button
                  onClick={handlePay}
                  disabled={payLoading}
                  className="bg-gradient-kleff rounded-full px-4 py-2 text-sm font-semibold text-black"
                >
                  {payLoading ? <Spinner /> : "Pay Now"}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-full px-4 py-2 text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
