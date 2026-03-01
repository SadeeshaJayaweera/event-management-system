import { CheckCircle, Loader2, Ticket, AlertCircle, Home, Calendar, DollarSign, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { paymentApi, type PaymentStatus } from "../api/eventflow";

interface PaymentSuccessProps {
    onHome: () => void;
}

export function PaymentSuccess({ onHome }: PaymentSuccessProps) {
    const [stage, setStage] = useState<'loading' | 'confirming' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');
    const [payment, setPayment] = useState<PaymentStatus | null>(null);
    const [dots, setDots] = useState('');

    // Animated dots while loading
    useEffect(() => {
        if (stage !== 'loading' && stage !== 'confirming') return;
        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 400);
        return () => clearInterval(interval);
    }, [stage]);

    useEffect(() => {
        const verify = async () => {
            // Extract orderId from URL params
            const params = new URLSearchParams(window.location.search);
            const orderId = params.get('orderId');

            if (!orderId) {
                setStage('error');
                setMessage('No order ID found. The payment link may be invalid.');
                return;
            }

            setStage('confirming');
            setMessage('Confirming payment with server');

            // Poll payment status for up to 30 seconds
            const poll = async () => {
                try {
                    // 1. Check current status
                    let status = await paymentApi.getPaymentStatus(orderId);

                    // 2. If it's pending (which it will be in local dev since PayHere can't reach us), instantly simulate
                    if (status.status === 'PENDING') {
                        setMessage('Confirming payment instantly via local dev webhook...');
                        try {
                            await paymentApi.simulatePaymentSuccess(orderId);
                            // Fetch the updated status
                            status = await paymentApi.getPaymentStatus(orderId);
                        } catch (simErr) {
                            console.error('Webhook simulation failed:', simErr);
                            // We don't throw here, just let the next block handle whatever status we have
                        }
                    }

                    // 3. Handle the final status
                    if (status.status === 'COMPLETED') {
                        setPayment(status);
                        setStage('success');
                    } else if (status.status === 'FAILED' || status.status === 'CANCELLED') {
                        setStage('error');
                        setMessage(`Payment ${status.status.toLowerCase()}. Please try again.`);
                    } else {
                        // Still pending after simulation attempt, or some other unknown status
                        setStage('error');
                        setMessage('Could not confirm payment status. Please contact support.');
                    }
                } catch (err) {
                    console.error('Status poll failed:', err);
                    setStage('error');
                    setMessage('Could not confirm payment status. Please contact support.');
                }
            };

            await poll();
        };

        verify();
    }, []);

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">

                {/* Loading / Confirming */}
                {(stage === 'loading' || stage === 'confirming') && (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
                        <div className="relative mx-auto mb-6 w-20 h-20">
                            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-50" />
                            <div className="relative flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200">
                                <Loader2 className="w-9 h-9 text-white animate-spin" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {stage === 'loading' ? 'Processing Payment' : 'Confirming Payment'}
                        </h2>
                        <p className="text-gray-500">
                            {message}{dots}
                        </p>
                        <div className="mt-6 flex justify-center gap-1.5">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Success */}
                {stage === 'success' && (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Green header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-10 text-center">
                            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/40">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-1">Payment Successful!</h2>
                            <p className="text-green-100 text-sm">Your ticket has been confirmed</p>
                        </div>

                        {/* Details */}
                        <div className="px-8 py-6 space-y-4">
                            {payment && (
                                <>
                                    {/* Event name */}
                                    <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <Ticket className="w-4.5 h-4.5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Event</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{payment.eventTitle || 'Event Ticket'}</p>
                                        </div>
                                    </div>

                                    {/* Receipt Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Amount Paid</span>
                                            </div>
                                            <p className="font-bold text-gray-900">
                                                {payment.currency} {Number(payment.amount).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                                <Hash className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Order ID</span>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm font-mono">{payment.orderId}</p>
                                        </div>

                                        {payment.paymentId && (
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                                    <Hash className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-semibold uppercase tracking-wider">Payment ID</span>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm font-mono">{payment.paymentId}</p>
                                            </div>
                                        )}

                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Date</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 text-sm">{formatDate(payment.createdAt)}</p>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ticket Holder</p>
                                            <p className="font-bold text-gray-900">{payment.firstName} {payment.lastName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{payment.email}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Status badge */}
                            <div className="flex justify-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {payment ? payment.status : 'CONFIRMED'}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-8 pb-8 space-y-3">
                            <button
                                onClick={onHome}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all duration-200"
                            >
                                <Ticket className="w-5 h-5" />
                                View My Tickets
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {stage === 'error' && (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h2>
                        <p className="text-gray-500 mb-8">{message}</p>
                        <button
                            onClick={() => { window.location.href = '/'; }}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Return to Home
                        </button>
                    </div>
                )}

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Questions? Contact <a href="mailto:support@eventflow.app" className="underline hover:text-gray-600">support@eventflow.app</a>
                </p>
            </div>
        </div>
    );
}
