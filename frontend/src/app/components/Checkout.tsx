import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { paymentApi, ticketApi, eventApi, type EventItem } from "../services/eventflow";
import { Loader2, ArrowLeft, CreditCard, CheckCircle, Minus, Plus, Ticket, MapPin, Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function Checkout() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState<EventItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [soldTickets, setSoldTickets] = useState(0);
    const [userTickets, setUserTickets] = useState(0);

    useEffect(() => {
        const loadEvent = async () => {
            if (!eventId || !user) {
                navigate('/attendee/discover');
                return;
            }
            try {
                const events = await eventApi.list();
                const foundEvent = events.find(e => e.id === eventId);
                if (foundEvent) {
                    setEvent(foundEvent);
                    const tickets = await ticketApi.list({ eventId });
                    setSoldTickets(tickets.length);
                    const userEventTickets = tickets.filter(t => t.userId === user.id);
                    setUserTickets(userEventTickets.length);
                } else {
                    toast.error("Event not found");
                    navigate('/attendee/discover');
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load event");
                navigate('/attendee/discover');
            } finally {
                setFetchLoading(false);
            }
        };
        loadEvent();
    }, [eventId, navigate, user]);

    if (fetchLoading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.loadingContent}>
                    <div style={styles.loadingSpinner}>
                        <Loader2 style={{ width: 28, height: 28, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                    </div>
                    <p style={styles.loadingText}>Loading event details…</p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!event) return null;

    const remainingTickets = event.maxTickets - soldTickets;
    const userCanPurchase = Math.min(3 - userTickets, remainingTickets);
    const totalPrice = event.price * quantity;

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity < 1 || newQuantity > userCanPurchase) return;
        setQuantity(newQuantity);
    };

    const handlePayment = async () => {
        if (!user) { toast.error("Please log in to continue"); return; }
        if (quantity > userCanPurchase) { toast.error(`You can only purchase ${userCanPurchase} more ticket(s)`); return; }

        setLoading(true);
        try {
            const orderId = `ORDER-${Date.now()}`;
            await paymentApi.initiate({ orderId, amount: totalPrice, currency: "LKR" });
            await new Promise(resolve => setTimeout(resolve, 1500));
            const purchasedTickets = await ticketApi.purchase({
                eventId: event.id, userId: user.id, price: event.price, quantity
            });
            console.log(`Successfully created ${purchasedTickets.length} ticket(s):`, purchasedTickets);
            setShowConfirmation(true);
            toast.success(quantity === 1 ? `Payment successful! Your ticket has been created.` : `Payment successful! ${quantity} tickets have been created.`);
            setTimeout(() => navigate('/attendee/tickets'), 2500);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Failed to process payment");
            setLoading(false);
        }
    };

    if (showConfirmation) {
        return (
            <div style={styles.pageWrapper}>
                <style>{globalStyles}</style>
                <div style={styles.confirmationCard}>
                    <div style={styles.confirmIconRing}>
                        <CheckCircle style={{ width: 40, height: 40, color: '#10b981' }} />
                    </div>
                    <h3 style={styles.confirmTitle}>You're going! 🎉</h3>
                    <p style={styles.confirmBody}>
                        <span style={styles.confirmHighlight}>{quantity} {quantity === 1 ? 'ticket' : 'tickets'}</span> secured for
                    </p>
                    <p style={styles.confirmEventName}>{event.title}</p>
                    <p style={styles.confirmSub}>Each ticket includes a unique QR code for entry</p>
                    <div style={styles.redirectPill}>Redirecting to your tickets…</div>
                </div>
            </div>
        );
    }

    const seatPct = Math.round((remainingTickets / event.maxTickets) * 100);

    return (
        <div style={styles.pageWrapper}>
            <style>{globalStyles}</style>

            <div style={styles.outerGrid}>
                {/* ── LEFT PANEL: Event Hero ── */}
                <div style={styles.heroPanel}>
                    {event.imageUrl && (
                        <div style={styles.heroImageWrap}>
                            <img src={event.imageUrl} alt={event.title} style={styles.heroImage} />
                            <div style={styles.heroOverlay} />
                        </div>
                    )}
                    <div style={styles.heroContent}>
                        <span style={styles.categoryBadge}>{event.category}</span>
                        <h1 style={styles.heroTitle}>{event.title}</h1>

                        <div style={styles.metaList}>
                            <div style={styles.metaRow}>
                                <Calendar style={styles.metaIcon} />
                                <span style={styles.metaText}>{event.date}</span>
                            </div>
                            <div style={styles.metaRow}>
                                <Clock style={styles.metaIcon} />
                                <span style={styles.metaText}>{event.time}</span>
                            </div>
                            <div style={styles.metaRow}>
                                <MapPin style={styles.metaIcon} />
                                <span style={styles.metaText}>{event.location}</span>
                            </div>
                        </div>

                        {/* Seat availability bar */}
                        <div style={styles.seatSection}>
                            <div style={styles.seatHeader}>
                                <div style={styles.seatLabel}>
                                    <Users style={{ width: 14, height: 14 }} />
                                    <span>Seats available</span>
                                </div>
                                <span style={{ ...styles.seatCount, color: remainingTickets < 10 ? '#f87171' : '#34d399' }}>
                                    {remainingTickets} / {event.maxTickets}
                                </span>
                            </div>
                            <div style={styles.progressTrack}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: `${seatPct}%`,
                                    background: remainingTickets < 10 ? '#f87171' : '#34d399'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Checkout Form ── */}
                <div style={styles.formPanel}>
                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>Checkout</h2>
                        <p style={styles.formSubtitle}>Complete your ticket purchase</p>
                    </div>

                    {/* Existing tickets notice */}
                    {userTickets > 0 && (
                        <div style={styles.noticeBox}>
                            <Ticket style={{ width: 16, height: 16, color: '#d97706', flexShrink: 0 }} />
                            <div>
                                <p style={styles.noticeTitle}>You already have {userTickets} {userTickets === 1 ? 'ticket' : 'tickets'}</p>
                                <p style={styles.noticeSub}>Up to {userCanPurchase} more available (max 3 per event)</p>
                            </div>
                        </div>
                    )}

                    {/* Quantity selector */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h3 style={styles.sectionTitle}>Quantity</h3>
                            <span style={styles.sectionHint}>Max 3 per person</span>
                        </div>
                        <div style={styles.qtyRow}>
                            <button
                                style={{ ...styles.qtyBtn, opacity: quantity <= 1 ? 0.4 : 1 }}
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                            >
                                <Minus style={{ width: 16, height: 16 }} />
                            </button>
                            <div style={styles.qtyDisplay}>
                                <span style={styles.qtyNumber}>{quantity}</span>
                                <span style={styles.qtyLabel}>{quantity === 1 ? 'ticket' : 'tickets'}</span>
                            </div>
                            <button
                                style={{ ...styles.qtyBtn, opacity: quantity >= userCanPurchase ? 0.4 : 1 }}
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= userCanPurchase}
                            >
                                <Plus style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                        {userCanPurchase === 0 && (
                            <p style={styles.errorNote}>
                                {userTickets >= 3 ? "Maximum of 3 tickets reached for this event" : "No tickets available"}
                            </p>
                        )}
                        {quantity > 1 && (
                            <p style={styles.qtyNote}>You'll receive {quantity} tickets with individual QR codes</p>
                        )}
                    </div>

                    {/* Price summary */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Summary</h3>
                        <div style={styles.summaryBox}>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>Price per ticket</span>
                                <span style={styles.summaryValue}>LKR {event.price.toLocaleString()}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>Quantity</span>
                                <span style={styles.summaryValue}>× {quantity}</span>
                            </div>
                            <div style={styles.summaryDivider} />
                            <div style={styles.summaryRow}>
                                <span style={styles.totalLabel}>Total</span>
                                <span style={styles.totalValue}>LKR {totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mock payment notice */}
                    <div style={styles.mockNotice}>
                        <CreditCard style={{ width: 15, height: 15, color: '#6366f1', flexShrink: 0 }} />
                        <span style={styles.mockText}>Simulated payment — no real transaction occurs</span>
                    </div>

                    {/* CTA */}
                    <button
                        style={{
                            ...styles.payBtn,
                            opacity: loading || userCanPurchase === 0 ? 0.6 : 1,
                            cursor: loading || userCanPurchase === 0 ? 'not-allowed' : 'pointer',
                        }}
                        onClick={handlePayment}
                        disabled={loading || userCanPurchase === 0}
                        className="pay-btn-hover"
                    >
                        {loading ? (
                            <>
                                <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                                Processing…
                            </>
                        ) : (
                            <>
                                <CreditCard style={{ width: 18, height: 18 }} />
                                Pay LKR {totalPrice.toLocaleString()}
                            </>
                        )}
                    </button>

                    <button
                        style={styles.cancelBtn}
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        className="cancel-btn-hover"
                    >
                        <ArrowLeft style={{ width: 14, height: 14 }} />
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f1ff 0%, #fafafa 50%, #f0fdf4 100%)',
        padding: 'clamp(12px, 2vw, 20px)',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 500,
        color: '#374151',
        cursor: 'pointer',
        marginBottom: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        transition: 'all .15s',
    },
    outerGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 'clamp(12px, 2vw, 20px)',
        maxWidth: 960,
        margin: '0 auto',
        alignItems: 'start',
    },

    /* Hero panel */
    heroPanel: {
        borderRadius: 20,
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 4px 24px rgba(99,102,241,.08)',
        border: '1px solid #e0e7ff',
    },
    heroImageWrap: {
        position: 'relative',
        height: 'clamp(180px, 28vw, 260px)',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    heroOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 40%, rgba(15,15,35,.5))',
    },
    heroContent: {
        padding: 'clamp(16px, 3vw, 24px)',
    },
    categoryBadge: {
        display: 'inline-block',
        background: '#ede9fe',
        color: '#6d28d9',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.07em',
        textTransform: 'uppercase' as const,
        padding: '4px 10px',
        borderRadius: 99,
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 'clamp(18px, 3vw, 24px)',
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 18px',
        lineHeight: 1.3,
    },
    metaList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 10,
        marginBottom: 22,
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        color: '#6b7280',
    },
    metaIcon: { width: 15, height: 15, color: '#6366f1', flexShrink: 0 } as React.CSSProperties,
    metaText: { fontSize: 14, color: '#374151' },
    seatSection: { marginTop: 4 },
    seatHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    seatLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        color: '#6b7280',
        fontWeight: 500,
    },
    seatCount: { fontSize: 12, fontWeight: 700 },
    progressTrack: {
        height: 6,
        background: '#f3f4f6',
        borderRadius: 99,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 99,
        transition: 'width .4s ease',
    },

    /* Form panel */
    formPanel: {
        background: 'white',
        borderRadius: 20,
        padding: 'clamp(16px, 3vw, 24px)',
        boxShadow: '0 4px 24px rgba(99,102,241,.08)',
        border: '1px solid #e0e7ff',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 18,
    },
    formHeader: { borderBottom: '1px solid #f3f4f6', paddingBottom: 12 },
    formTitle: {
        fontSize: 'clamp(20px, 3.5vw, 26px)',
        fontWeight: 800,
        color: '#111827',
        margin: '0 0 4px',
        letterSpacing: '-.02em',
    },
    formSubtitle: { fontSize: 13, color: '#9ca3af', margin: 0 },

    /* Notice */
    noticeBox: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 12,
        padding: '12px 14px',
    },
    noticeTitle: { fontSize: 13, fontWeight: 600, color: '#92400e', margin: '0 0 2px' },
    noticeSub: { fontSize: 11, color: '#b45309', margin: 0 },

    /* Section */
    section: {},
    sectionHeader: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 },
    sectionHint: { fontSize: 11, color: '#9ca3af' },

    /* Quantity */
    qtyRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: '16px 20px',
    },
    qtyBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        border: '1.5px solid #d1d5db',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#374151',
        transition: 'all .15s',
        flexShrink: 0,
    },
    qtyDisplay: { textAlign: 'center' as const, minWidth: 56 },
    qtyNumber: { display: 'block', fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 },
    qtyLabel: { display: 'block', fontSize: 11, color: '#9ca3af', marginTop: 2 },
    qtyNote: { fontSize: 11, color: '#6366f1', textAlign: 'center' as const, marginTop: 8, fontWeight: 500 },
    errorNote: { fontSize: 11, color: '#ef4444', textAlign: 'center' as const, marginTop: 8 },

    /* Summary */
    summaryBox: {
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 10,
    },
    summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 13, color: '#6b7280' },
    summaryValue: { fontSize: 13, color: '#374151', fontWeight: 500 },
    summaryDivider: { borderTop: '1px solid #e5e7eb', margin: '2px 0' },
    totalLabel: { fontSize: 15, fontWeight: 700, color: '#111827' },
    totalValue: { fontSize: 17, fontWeight: 800, color: '#6366f1' },

    /* Mock notice */
    mockNotice: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#eef2ff',
        border: '1px solid #c7d2fe',
        borderRadius: 10,
        padding: '10px 14px',
    },
    mockText: { fontSize: 12, color: '#4f46e5' },

    /* Buttons */
    payBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        border: 'none',
        borderRadius: 13,
        padding: '15px 20px',
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '-.01em',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(99,102,241,.35)',
        transition: 'all .2s',
    },
    cancelBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        background: 'transparent',
        border: 'none',
        color: '#9ca3af',
        fontSize: 13,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: 8,
        transition: 'color .15s',
    },

    /* Loading */
    loadingScreen: {
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContent: { textAlign: 'center' as const },
    loadingSpinner: { marginBottom: 12 },
    loadingText: { fontSize: 13, color: '#9ca3af' },

    /* Confirmation */
    confirmationCard: {
        maxWidth: 420,
        margin: '40px auto 0',
        background: 'white',
        borderRadius: 24,
        padding: 'clamp(20px, 4vw, 32px)',
        textAlign: 'center' as const,
        boxShadow: '0 8px 40px rgba(16,185,129,.12)',
        border: '1px solid #d1fae5',
    },
    confirmIconRing: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#d1fae5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
    },
    confirmTitle: { fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 10px' },
    confirmBody: { fontSize: 14, color: '#6b7280', margin: '0 0 4px' },
    confirmHighlight: { fontWeight: 700, color: '#6366f1' },
    confirmEventName: { fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' },
    confirmSub: { fontSize: 12, color: '#9ca3af', margin: '0 0 20px' },
    redirectPill: {
        display: 'inline-block',
        background: '#f3f4f6',
        color: '#9ca3af',
        fontSize: 12,
        borderRadius: 99,
        padding: '6px 14px',
    },
};

const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
    * { box-sizing: border-box; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .pay-btn-hover:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,.45) !important; }
    .cancel-btn-hover:hover:not(:disabled) { color: #374151 !important; }

    /* Stack panels vertically on small screens */
    @media (max-width: 640px) {
        .back-btn { margin-bottom: 16px; }
    }
`;