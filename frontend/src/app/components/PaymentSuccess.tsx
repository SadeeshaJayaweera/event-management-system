import { CheckCircle, Ticket, Home, Calendar, DollarSign, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketApi } from "../services/eventflow";

export function PaymentSuccess() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying payment...');

    useEffect(() => {
        if (!orderId) return;

        // Fire the simulation (fire-and-forget) so the backend records the ticket
        paymentApi.simulatePaymentSuccess(orderId).catch(() => { });

            try {
                const { eventId, price, title, quantity = 1 } = JSON.parse(pendingPurchase);
                const userStr = localStorage.getItem('user');

                if (!userStr) {
                    setStatus('error');
                    setMessage('User session not found. Please login again.');
                    return;
                }

                const user = JSON.parse(userStr);

                // Call backend to create ticket
                await ticketApi.purchase({
                    eventId,
                    userId: user.id,
                    price,
                    quantity
                });

                setStatus('success');
                localStorage.removeItem('pending_purchase'); // Clear pending purchase

            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage('Failed to create ticket. Please contact support.');
            }
        };

        createTicket();
    }, []);

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

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">

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
                        {/* Event name */}
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

                        {/* Receipt Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Amount Paid</span>
                                </div>
                                <p className="font-bold text-gray-900">
                                    {payment ? `${payment.currency} ${Number(payment.amount).toFixed(2)}` : 'LKR —'}
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                    <Hash className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Order ID</span>
                                </div>
                                <p className="font-bold text-gray-900 text-sm font-mono">{orderId}</p>
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
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ticket Holder</p>
                                    <p className="font-bold text-gray-900">{payment.firstName} {payment.lastName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{payment.email}</p>
                                </div>
                            )}
                        </div>

                        {/* Status badge */}
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                <CheckCircle className="w-3.5 h-3.5" />
                                CONFIRMED
                            </span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="px-8 pb-8 space-y-3">
                        <button
                            onClick={() => navigate('/attendee/tickets')}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <Ticket className="w-5 h-5" />
                            View My Tickets
                        </button>
                        <button
                            onClick={() => navigate('/attendee')}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Questions? Contact <a href="mailto:support@eventflow.app" className="underline hover:text-gray-600">support@eventflow.app</a>
                </p>
            </div>
        </div>
    );
}
