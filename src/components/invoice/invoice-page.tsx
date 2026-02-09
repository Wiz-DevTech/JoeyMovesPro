'use client';

import { Invoice, Job, Payment } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Download, Mail, Printer } from 'lucide-react';
import { toast } from 'sonner';

type InvoiceWithRelations = Invoice & {
  job: Job;
  payments: Payment[];
};

interface InvoicePageProps {
  invoice: InvoiceWithRelations;
}

export function InvoicePage({ invoice }: InvoicePageProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleEmail = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast.success('Invoice sent via email');
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send invoice');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Actions Bar (No Print) */}
      <div className="no-print flex justify-end space-x-2 mb-6">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleEmail}>
          <Mail className="w-4 h-4 mr-2" />
          Email Invoice
        </Button>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 print-break-inside-avoid">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-600">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Joey Moves Pro</h2>
            <p className="text-gray-600">Spring Hill, FL</p>
            <p className="text-gray-600">(813) 555-0100</p>
            <p className="text-gray-600">support@joeymoves.com</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="text-gray-800">{invoice.job.customerName}</p>
            <p className="text-gray-600">{invoice.job.customerEmail}</p>
            <p className="text-gray-600">{invoice.job.customerPhone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Invoice Details:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Invoice Date:</span>
              <span className="text-gray-900">
                {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
              </span>
              <span className="text-gray-600">Job Number:</span>
              <span className="text-gray-900">{invoice.job.jobNumber}</span>
              <span className="text-gray-600">Status:</span>
              <span className="text-gray-900">{invoice.status}</span>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Move Details:</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">From:</span>
                <p className="text-gray-900 font-medium">{invoice.job.pickupAddress}</p>
              </div>
              <div>
                <span className="text-gray-600">To:</span>
                <p className="text-gray-900 font-medium">{invoice.job.dropoffAddress}</p>
              </div>
              {invoice.job.scheduledDate && (
                <>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="text-gray-900 font-medium">
                      {format(new Date(invoice.job.scheduledDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="text-gray-900 font-medium">{invoice.job.scheduledTime}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-900 font-semibold">Description</th>
                <th className="text-right py-3 text-gray-900 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800">Moving Services</td>
                <td className="text-right py-3 text-gray-800">
                  ${invoice.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-800">Tax (7%)</td>
                <td className="text-right py-3 text-gray-800">
                  ${invoice.taxAmount.toFixed(2)}
                </td>
              </tr>
              <tr className="border-b-2 border-gray-300">
                <td className="py-3 font-semibold text-gray-900">Total</td>
                <td className="text-right py-3 font-semibold text-gray-900">
                  ${invoice.total.toFixed(2)}
                </td>
              </tr>
              {invoice.depositPaid && (
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-800">Deposit Paid</td>
                  <td className="text-right py-3 text-green-600">
                    -${invoice.depositAmount.toFixed(2)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-3 font-bold text-gray-900 text-lg">Amount Due</td>
                <td className="text-right py-3 font-bold text-blue-600 text-lg">
                  ${invoice.finalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Payment History:</h3>
            <div className="space-y-2">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <div>
                    <span className="text-gray-800">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <span className="ml-3 text-sm text-gray-600">
                      {payment.method} - {payment.status}
                    </span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    ${payment.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p>Thank you for choosing Joey Moves Pro!</p>
          <p className="mt-2">
            Questions? Contact us at support@joeymoves.com or (813) 555-0100
          </p>
        </div>
      </div>
    </div>
  );
}