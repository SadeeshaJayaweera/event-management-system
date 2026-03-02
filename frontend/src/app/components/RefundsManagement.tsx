
import { paymentApi, type PaymentStatus } from "../api/eventflow";
import { useState, useEffect } from "react";
import { DollarSign, User, Calendar, CreditCard, CheckCircle, Clock, ChevronRight, ArrowLeft, Building, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

export function RefundsManagement() {
    const [refunds, setRefunds] = useState<PaymentStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState<PaymentStatus | null>(null);
    const [markingDone, setMarkingDone] = useState<string | null>(null);
    const [confirmDoneFor, setConfirmDoneFor] = useState<PaymentStatus | null>(null);

    useEffect(() => {
        loadRefunds();
    }, []);

    const loadRefunds = async () => {
        setLoading(true);
        try {
            const data = await paymentApi.getAllRefunds();
            setRefunds(data);
        } catch {
            toast.error("Failed to load refunds");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDone = async (orderId: string) => {
        setMarkingDone(orderId);
        try {
            await paymentApi.markRefundDone(orderId);
            setRefunds(prev => prev.map(r => r.orderId === orderId ? { ...r, status: "REFUND_DONE" } : r));
            if (selectedRefund?.orderId === orderId) {
                setSelectedRefund(prev => prev ? { ...prev, status: "REFUND_DONE" } : null);
            }
            setConfirmDoneFor(null);
            toast.success("Refund marked as done!");
        } catch {
            toast.error("Failed to update refund status");
        } finally {
            setMarkingDone(null);
        }
    };

    const pending = refunds.filter(r => r.status === "REFUNDED");
    const done = refunds.filter(r => r.status === "REFUND_DONE");

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">Loading refunds...</p>
                </div>
            </div>
        );
    }

    // Detail view
    if (selectedRefund) {
        const isDone = selectedRefund.status === "REFUND_DONE";
        return (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400">
                {/* Confirm Done Modal */}
                {confirmDoneFor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Mark as Refund Done?</h3>
                                <p className="text-gray-500 text-sm mb-2">
                                    Confirm that you have manually transferred{" "}
                                    <span className="font-semibold text-gray-800">
                                        {confirmDoneFor.currency} {Number(confirmDoneFor.amount).toFixed(2)}
                                    </span>{" "}
                                    to the user's bank account.
                                </p>
                                <p className="text-xs text-gray-400 mb-5">Order: {confirmDoneFor.orderId}</p>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setConfirmDoneFor(null)}
                                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button
                                        disabled={markingDone === confirmDoneFor.orderId}
                                        onClick={() => handleMarkDone(confirmDoneFor.orderId)}
                                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        {markingDone === confirmDoneFor.orderId
                                            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                                            : "✓ Confirm Done"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={() => setSelectedRefund(null)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Refunds
                </button>

                <div className={`rounded-2xl border p-6 mb-5 ${isDone ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDone ? 'bg-green-100' : 'bg-amber-100'}`}>
                                <DollarSign className={`w-6 h-6 ${isDone ? 'text-green-600' : 'text-amber-600'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Refund Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {selectedRefund.currency} {Number(selectedRefund.amount).toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${isDone
                            ? 'bg-green-200 text-green-800'
                            : 'bg-amber-200 text-amber-800'}`}>
                            {isDone ? "✓ Refund Done" : "⏳ Pending"}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Event Details */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Event Details
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Event</span>
                                <span className="text-sm font-semibold text-gray-900">{selectedRefund.eventTitle || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Order ID</span>
                                <span className="text-sm font-mono text-gray-700">{selectedRefund.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Payment Date</span>
                                <span className="text-sm text-gray-700">
                                    {selectedRefund.createdAt ? new Date(selectedRefund.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Refund Requested</span>
                                <span className="text-sm font-medium text-amber-700">
                                    {selectedRefund.updatedAt ? new Date(selectedRefund.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" /> User Details
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Name</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {[selectedRefund.firstName, selectedRefund.lastName].filter(Boolean).join(" ") || "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Email</span>
                                <span className="text-sm text-gray-700">{selectedRefund.email || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">User ID</span>
                                <span className="text-xs font-mono text-gray-500">{selectedRefund.userId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className={`rounded-xl border shadow-sm p-5 ${selectedRefund.bankAccountNumber
                        ? "bg-white border-gray-100"
                        : "bg-gray-50 border-dashed border-gray-200"
                        }`}>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Building className="w-4 h-4" /> Bank Details
                        </h3>
                        {selectedRefund.bankAccountNumber ? (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Bank</span>
                                    <span className="text-sm font-semibold text-gray-900">{selectedRefund.bankName || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Branch</span>
                                    <span className="text-sm text-gray-700">{selectedRefund.bankBranch || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Account Name</span>
                                    <span className="text-sm font-semibold text-gray-900">{selectedRefund.bankAccountName || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Account No.</span>
                                    <span className="text-sm font-mono font-bold text-indigo-700 text-base">{selectedRefund.bankAccountNumber}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">User has not provided bank details yet.</p>
                        )}
                    </div>

                    {/* Action */}
                    {!isDone && (
                        <button
                            onClick={() => setConfirmDoneFor(selectedRefund)}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Mark Refund as Done
                        </button>
                    )}
                    {isDone && (
                        <div className="flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
                            <CheckCircle className="w-5 h-5" /> Refund Completed
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
                    <p className="text-gray-500 mt-1">Manage manual refunds for cancelled events.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold">
                        {pending.length} Pending
                    </div>
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                        {done.length} Done
                    </div>
                </div>
            </div>

            {refunds.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No refund requests</h3>
                    <p className="text-gray-500 mt-1">Refund requests will appear here when events are cancelled.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Pending */}
                    {pending.length > 0 && (
                        <>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" /> Pending Refunds
                            </h2>
                            {pending.map(refund => (
                                <button key={refund.orderId} onClick={() => setSelectedRefund(refund)}
                                    className="w-full bg-white rounded-xl border border-amber-100 shadow-sm p-4 hover:shadow-md transition-shadow text-left flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {[refund.firstName, refund.lastName].filter(Boolean).join(" ") || refund.email || "Unknown User"}
                                            </p>
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Pending</span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{refund.email}</p>
                                        <p className="text-xs text-gray-400 truncate">{refund.eventTitle} · {refund.updatedAt ? new Date(refund.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</p>
                                        {refund.bankAccountNumber
                                            ? <p className="text-xs text-indigo-600 mt-0.5">🏦 Bank details provided</p>
                                            : <p className="text-xs text-red-400 mt-0.5">⚠️ No bank details yet</p>}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-gray-900">{refund.currency} {Number(refund.amount).toFixed(2)}</p>
                                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </>
                    )}

                    {/* Done */}
                    {done.length > 0 && (
                        <>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1 flex items-center gap-2 mt-6">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Completed Refunds
                            </h2>
                            {done.map(refund => (
                                <button key={refund.orderId} onClick={() => setSelectedRefund(refund)}
                                    className="w-full bg-white rounded-xl border border-green-100 shadow-sm p-4 hover:shadow-md transition-shadow text-left flex items-center gap-4 group opacity-80">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {[refund.firstName, refund.lastName].filter(Boolean).join(" ") || refund.email || "Unknown User"}
                                            </p>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Done</span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{refund.email}</p>
                                        <p className="text-xs text-gray-400 truncate">{refund.eventTitle} · {refund.updatedAt ? new Date(refund.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-gray-700">{refund.currency} {Number(refund.amount).toFixed(2)}</p>
                                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
