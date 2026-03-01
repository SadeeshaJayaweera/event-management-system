import { useState } from "react";
import { paymentApi, type EventItem, type PaymentInitPayload } from "../api/eventflow";
import { Loader2, ArrowLeft, Shield, CreditCard, Calendar, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface CheckoutProps {
    event: EventItem;
    user: { id: string; name: string; role: string; email?: string };
    onBack: () => void;
}

export function Checkout({ event, user, onBack }: CheckoutProps) {
    const [loading, setLoading] = useState(false);

    if (!event) return null;

    const nameParts = user.name.trim().split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "User";

    const handlePayment = async () => {
        setLoading(true);
        try {
            const payload: PaymentInitPayload = {
                eventId: event.id,
                userId: user.id,
                amount: event.price,
                firstName,
                lastName,
                email: user.email || `${user.id}@eventflow.app`,
                phone: "0771234567",
                eventTitle: event.title,
            };

            const paymentData = await paymentApi.initPayment(payload);

            // Build a hidden PayHere form and submit it
            const form = document.createElement("form");
            form.method = "POST";
            form.action = paymentData.sandbox
                ? "https://sandbox.payhere.lk/pay/checkout"
                : "https://www.payhere.lk/pay/checkout";

            const params: Record<string, string> = {
                merchant_id: paymentData.merchantId,
                return_url: paymentData.returnUrl,
                cancel_url: paymentData.cancelUrl,
                notify_url: paymentData.notifyUrl,
                order_id: paymentData.orderId,
                items: paymentData.itemName,
                currency: paymentData.currency,
                amount: paymentData.amount,
                first_name: paymentData.firstName,
                last_name: paymentData.lastName,
                email: paymentData.email,
                phone: paymentData.phone,
                address: "No.1, Galle Road",
                city: "Colombo",
                country: "Sri Lanka",
                hash: paymentData.hash,
            };

            Object.entries(params).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate payment. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
                        <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Secure Checkout</h2>
                    <p className="text-gray-500 mt-1">Complete your ticket purchase via PayHere</p>
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Event Banner */}
                    {event.imageUrl && (
                        <div className="relative h-48 overflow-hidden">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{event.category}</span>
                                <h3 className="text-2xl font-bold text-white mt-1">{event.title}</h3>
                            </div>
                        </div>
                    )}

                    <div className="p-8">
                        {/* Event Meta */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Date</p>
                                    <p className="text-sm font-semibold text-gray-900">{event.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Venue</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{event.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <DollarSign className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Price</p>
                                    <p className="text-sm font-semibold text-gray-900">LKR {event.price.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Buyer Summary */}
                        <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-sm font-semibold text-indigo-800 mb-2">Ticket holder</p>
                            <p className="text-sm text-indigo-700 font-medium">{user.name}</p>
                            <p className="text-xs text-indigo-500 mt-0.5">{user.email || `User ID: ${user.id.slice(0, 8)}`}</p>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-gray-100 pt-6 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Ticket × 1</span>
                                <span className="text-sm text-gray-900 font-medium">LKR {event.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500">Service fee</span>
                                <span className="text-sm text-gray-500">LKR 0.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-indigo-600">LKR {event.price.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Redirecting to PayHere...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5" />
                                    Pay LKR {event.price.toFixed(2)} with PayHere
                                </>
                            )}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="w-full mt-3 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>

                        {/* Security Badge */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Powered by PayHere · PCI-DSS Compliant · Secure 256-bit SSL</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
