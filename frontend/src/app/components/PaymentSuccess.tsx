import { CheckCircle, Ticket, Home, Calendar, DollarSign, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketApi, paymentApi } from "../services/eventflow";

export function PaymentSuccess() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying payment...');
    const [payment, setPayment] = useState<any>(null);

    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (!orderId) {
            setStatus('error');
            setMessage('Order ID not found');
            return;
        }

        const createTicket = async () => {
            try {
                // Fire the simulation (fire-and-forget) so the backend records the ticket
                paymentApi.simulatePaymentSuccess(orderId).catch(() => { });

                const pendingStr = localStorage.getItem('pending_purchase');
                if (!pendingStr) {
                    throw new Error('No pending purchase found');
                }
                const pendingPurchase = JSON.parse(pendingStr);

                const { eventId, price, title, quantity = 1, currency = 'LKR' } = pendingPurchase;
                const authStr = localStorage.getItem('eventflow_auth');

                if (!authStr) {
                    setStatus('error');
                    setMessage('User session not found. Please login again.');
                    return;
                }

                const authData = JSON.parse(authStr);
                const user = authData.user;

                if (!user || !user.id) {
                    setStatus('error');
                    setMessage('User session is invalid. Please login again.');
                    return;
                }

                // Call backend to create ticket
                await ticketApi.purchase({
                    eventId,
                    userId: user.id,
                    price,
                    quantity
                });

                setStatus('success');
                localStorage.removeItem('pending_purchase'); // Clear pending purchase

                setPayment({
                    amount: price * quantity,
                    currency: currency,
                    eventTitle: title,
                    createdAt: new Date().toISOString(),
                    firstName: user.firstName || user.name,
                    lastName: user.lastName || '',
                    email: user.email
                });

            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage('Failed to create ticket. Please contact support.');
            }
        };

        createTicket();
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
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-xl font-bold text-gray-900">{message}</h2>
                <p className="text-gray-500">Please wait while we confirm your ticket.</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl text-red-600 font-bold px-4 py-2 border-2 border-red-600 rounded-full">X</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-500 text-center max-w-md mb-8">
                    {message}
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
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ticket Holder</p>
                                    <p className="font-bold text-gray-900 truncate">{payment.firstName} {payment.lastName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{payment.email}</p>
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
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors gap-2"
                        >
                            <Ticket className="w-5 h-5" />
                            View My Tickets
                        </button>
                        <button
                            onClick={() => navigate('/attendee')}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors gap-2"
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
