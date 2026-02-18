import { useState } from "react";
import { paymentApi, type EventItem } from "../api/eventflow";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface CheckoutProps {
    event: EventItem;
    onBack: () => void;
}

export function Checkout({ event, onBack }: CheckoutProps) {
    const [loading, setLoading] = useState(false);

    if (!event) return null;

    const handlePayment = async () => {
        setLoading(true);
        try {
            const orderId = `ORDER-${Date.now()}`;
            const amount = event.price;
            const currency = "LKR"; // Sandbox defaults

            // 1. Get hash and signed params from backend
            const paymentData = await paymentApi.initiate({
                orderId,
                amount,
                currency
            });

            // 2. Create a hidden form and submit to PayHere
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://sandbox.payhere.lk/pay/checkout";

            const params = {
                merchant_id: paymentData.merchant_id,
                return_url: `${window.location.origin}/payment/success`, // Success URL
                cancel_url: `${window.location.origin}/`, // Cancel URL
                notify_url: "https://example.com/api/payment/notify", // Must be public, using dummy for localhost
                order_id: paymentData.order_id,
                items: event.title,
                currency: paymentData.currency,
                amount: paymentData.amount,
                first_name: "John", // Dummy data for sandbox
                last_name: "Doe",
                email: "john@example.com",
                phone: "0771234567",
                address: "No.1, Galle Road",
                city: "Colombo",
                country: "Sri Lanka",
                hash: paymentData.hash // Secure hash from backend
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
            toast.error("Failed to initiate payment");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Checkout
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Event Details</h3>
                            <div className="mt-2 text-sm text-gray-500">
                                <p><span className="font-medium text-gray-900">Event:</span> {event.title}</p>
                                <p><span className="font-medium text-gray-900">Price:</span> LKR {event.price}</p>
                                <p><span className="font-medium text-gray-900">Date:</span> {event.date}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Processing...
                                    </>
                                ) : (
                                    "Pay with PayHere"
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={onBack}
                                className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
