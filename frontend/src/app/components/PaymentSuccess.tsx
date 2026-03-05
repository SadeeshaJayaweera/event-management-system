import { CheckCircle, Ticket, Home, Calendar, DollarSign, Hash, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paymentApi, type PaymentStatus } from "../services/eventflow";

export function PaymentSuccess() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'err'>('loading');
    const [payment, setPayment] = useState<PaymentStatus | null>(null);

    // Extract orderId from URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId') || params.get('order_id') || '';

    useEffect(() => {
        if (!orderId) {
            setStatus('err');
            return;
        }

        const verifyAndLoad = async () => {
            try {
                // Fire the simulation (fire-and-forget) so the backend records the ticket
                // In a real PayHere integration, the notify_url does this, but for the demo/sandbox 
                // we often force it from the client return URL for immediate feedback.
                await paymentApi.simulatePaymentSuccess(orderId).catch(() => { });

                // Fetch payment details for the receipt
                const data = await paymentApi.getPaymentStatus(orderId);
                setPayment(data);
                setStatus('success');
            } catch (error) {
                console.error("Failed to verify payment:", error);
                setStatus('err');
            }
        };

        verifyAndLoad();
    }, [orderId]);

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return new Date().toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Verifying Payment...</h2>
                <p className="text-gray-500">Please wait while we confirm your ticket.</p>
            </div>
        );
    }

    if (status === 'err') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-500 text-center max-w-md mb-8">
                    We couldn't verify your payment. If you've been charged, don't worry—our team will process it shortly.
                </p>
                <button 
                  onClick={() => navigate('/attendee')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100"
                >
                  Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-10 text-center">
                        <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/40">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">Payment Successful!</h2>
                        <p className="text-green-100 text-sm">Your ticket has been confirmed</p>
                    </div>

                    <div className="px-8 py-6 space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Ticket className="w-4.5 h-4.5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Event</p>
                                <p className="font-bold text-gray-900 mt-0.5">
                                    {payment?.eventTitle || 'Event Ticket'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Amount</span>
                                </div>
                                <p className="font-bold text-gray-900">
                                    {payment ? `${payment.currency} ${Number(payment.amount).toFixed(2)}` : 'LKR 0.00'}
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                    <Hash className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Order ID</span>
                                </div>
                                <p className="font-bold text-gray-900 text-sm font-mono truncate">{orderId}</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Date</span>
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {formatDate(payment?.createdAt)}
                                </p>
                            </div>

                            {payment && (
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Attendee</p>
                                    <p className="font-bold text-gray-900 truncate">{payment.firstName} {payment.lastName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{payment.email}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                <CheckCircle className="w-3.5 h-3.5" />
                                CONFIRMED
                            </span>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-3">
                        <button
                            onClick={() => navigate('/attendee/tickets')}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-base shadow-lg shadow-indigo-100 transition-all duration-200"
                        >
                            <Ticket className="w-5 h-5" />
                            View My Tickets
                        </button>
                        <button
                            onClick={() => navigate('/attendee')}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Questions? Contact <a href="mailto:support@eventflow.app" className="underline hover:text-gray-600">support@eventflow.app</a>
                </p>
            </div>
        </div>
    );
}

function XCircle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
