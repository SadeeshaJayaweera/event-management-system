import { CheckCircle, ArrowLeft } from "lucide-react";

interface PaymentSuccessProps {
    onHome: () => void;
}

export function PaymentSuccess({ onHome }: PaymentSuccessProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Available!</h2>
                <p className="text-gray-600 mb-8">
                    Your payment was successful and your ticket has been booked. You will receive a confirmation email shortly.
                </p>
                <button
                    onClick={onHome}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </button>
            </div>
        </div>
    );
}
