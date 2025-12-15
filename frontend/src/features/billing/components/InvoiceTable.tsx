import { useState, useEffect } from 'react';
import { DollarSign, Calendar, X, Eye, Loader2 } from 'lucide-react';
import type { Invoice } from '@features/billing/types/Invoice';
import fetchInvoice from '../api/viewInvoicesForProject';

interface InvoiceTableProps {
  projectId: string;
}

export default function InvoiceTable({ projectId }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInvoice();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            <p className="text-neutral-400">Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br  p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-50">Invoices</h1>
              <p className="text-sm text-neutral-400">
                {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {invoices.length === 0 ? (
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">No invoices found</h3>
              <p className="text-sm text-neutral-500">There are no invoices for this project yet.</p>
            </div>
          </div>
        ) : (
          /* Table Container with dynamic height */
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg overflow-hidden">
            <div 
              className="overflow-x-auto overflow-y-auto"
              style={{
                maxHeight: invoices.length > 10 ? '600px' : 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#404040 #171717'
              }}
            >
              <table className="w-full">
                <thead className="bg-neutral-800/50 border-b border-neutral-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-800/90">
                      Invoice ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-800/90">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-800/90">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-800/90">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-800/90">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-800/90">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice.invoiceId} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-neutral-200">{invoice.invoiceId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-300">{invoice.projectId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                          <Calendar className="h-4 w-4 text-neutral-500" />
                          <span>
                            {new Date(invoice.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(invoice.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-neutral-50">${invoice.total.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
          onClick={() => setSelectedInvoice(null)}
        >
          <div 
            className="bg-neutral-900 rounded-lg p-6 max-w-2xl w-full border border-neutral-800 shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-50">Invoice Details - #{selectedInvoice.invoiceId}</h3>
              <button 
                onClick={() => setSelectedInvoice(null)} 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Invoice ID</p>
                  <p className="text-base font-medium text-neutral-200">{selectedInvoice.invoiceId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Project ID</p>
                  <p className="text-base font-medium text-neutral-200">{selectedInvoice.projectId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Billing Period</p>
                  <p className="text-base font-medium text-neutral-200">
                    {new Date(selectedInvoice.startDate).toLocaleDateString()} - {new Date(selectedInvoice.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-6">
                <h4 className="text-sm font-semibold text-neutral-400 mb-4">Payment Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300">Subtotal</span>
                    <span className="font-medium text-neutral-200">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300">Taxes</span>
                    <span className="font-medium text-neutral-200">${selectedInvoice.taxes.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-800 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-neutral-50">Total</span>
                    <span className="text-lg font-bold text-emerald-400">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}