import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const getSeatTiersList = (seatNumbers, event) => {
  if (!event || event.ticketType === "free") return "Free Entry";
  
  const totalSeats = event.totalSeats || 0;
  const category = event.category?.toLowerCase() || "";
  const isConcert = category.includes("concert") || category.includes("music") || category.includes("festival") || category.includes("nightlife");
  
  if (!isConcert) return "General Admission";
  
  const tiers = seatNumbers.map(seatNum => {
    if (seatNum <= Math.ceil(totalSeats * 0.15)) return "VIP";
    if (seatNum <= Math.ceil(totalSeats * 0.40)) return "Gold";
    return "General Admission";
  });
  
  return [...new Set(tiers)].join(", ");
};

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [mockOrder, setMockOrder] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Reservation Timer Logic
  useEffect(() => {
    let timer;
    if (showBooking && timeLeft > 0 && !bookingConfirmed) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && showBooking && !bookingConfirmed) {
      setShowBooking(false);
      setBookingError("Reservation expired. Please select your seats again.");
      setSelectedSeats([]); // Clear selection on expire
      setTimeLeft(600);
    }
    return () => clearInterval(timer);
  }, [showBooking, timeLeft, bookingConfirmed]);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const seats = event.seats || [];
  const totalSeats = event.totalSeats || seats.length;
  const basePrice = event.ticketType === "free" ? 0 : (event.ticketPrice || 0);

  const category = event.category?.toLowerCase() || "";
  const isConcert = category.includes("concert") || category.includes("music") || category.includes("festival") || category.includes("nightlife");

  // Tier info based on seat number
  const getSeatTierInfo = (seatNumber) => {
    if (event.ticketType === "free") return { name: "Free Entry", price: 0, color: "border-slate-300 dark:border-zinc-600" };

    if (seatNumber <= Math.ceil(totalSeats * 0.15)) {
      return { name: "VIP", price: Math.round(basePrice * 3), color: "border-pink-500" };
    }
    if (seatNumber <= Math.ceil(totalSeats * 0.40)) {
      return { name: "Gold", price: Math.round(basePrice * 2), color: "border-teal-500" };
    }
    return { name: "General Admission", price: basePrice, color: "border-blue-500" };
  };

  const totalPrice = selectedSeats.reduce((sum, seatNum) => sum + getSeatTierInfo(seatNum).price, 0);

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(num => num !== seatNumber));
    } else {
      if (selectedSeats.length >= 10) return; // max 10
      setSelectedSeats([...selectedSeats, seatNumber].sort((a, b) => a - b));
    }
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setReserving(true);
    setBookingError("");

    try {
      const { data } = await API.post("/reserve", {
        eventId: event._id,
        seatNumbers: selectedSeats,
      });

      setReservationId(data.reservation._id);
      setTimeLeft(600);
      setShowBooking(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Seats may have just been booked. Please try again.");
      // Refresh event
      const { data } = await API.get(`/events/${id}`);
      setEvent(data);
      setSelectedSeats([]);
    } finally {
      setReserving(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!reservationId) return;

    setReserving(true);
    setBookingError("");

    try {
      // Step 1: Create order
      const { data: orderData } = await API.post("/bookings/razorpay-order", { reservationId });

      if (orderData.paymentRequired === false) {
        await API.post("/bookings", { reservationId });
        setBookingConfirmed(true);
        return;
      }

      // Step 2: Handle Checkout
      if (orderData.isMock) {
        setMockOrder(orderData);
        setShowMockModal(true);
      } else {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "SeatFlow",
          description: `Booking for ${event.name}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              setReserving(true);
              await API.post("/bookings", {
                reservationId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              setBookingConfirmed(true);
            } catch (err) {
              setBookingError(err.response?.data?.message || "Failed to verify transaction on server");
            } finally {
              setReserving(false);
            }
          },
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: function () {
              setReserving(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setBookingError(`Payment failed: ${response.error.description}`);
          setReserving(false);
        });
        rzp.open();
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to initiate payment order");
    } finally {
      setReserving(false);
    }
  };

  const handleMockPaymentSuccess = async () => {
    if (!mockOrder) return;
    setShowMockModal(false);
    setReserving(true);
    try {
      const mockPaymentId = `pay_mock_${Date.now()}`;
      await API.post("/bookings", {
        reservationId,
        razorpayPaymentId: mockPaymentId,
        razorpayOrderId: mockOrder.orderId,
        razorpaySignature: "mock_signature_signature",
      });
      setBookingConfirmed(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to confirm payment simulation");
    } finally {
      setReserving(false);
    }
  };

  const handleMockPaymentFail = () => {
    setShowMockModal(false);
    setBookingError("Simulated payment was cancelled.");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "TBA";

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-200">

      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center px-4 flex-shrink-0 bg-white dark:bg-[#0a0a0a]">
        <button onClick={() => navigate(`/events/${id}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors mr-4">
          <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold truncate leading-tight">{event.name}</h1>
          <p className="text-xs text-slate-500 font-medium">{event.venue} | {eventDate}, {event.time}</p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
          <span className="text-slate-500">{selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''}</span>
          <button onClick={() => setSelectedSeats([])} className="text-primary hover:text-primary-dark transition-colors">Clear</button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar (Legend & Info) */}
        <aside className="w-72 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-6 hidden md:flex flex-col flex-shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Key Map</h3>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-sm border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"></div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-sm border-none bg-emerald-500"></div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Selected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-sm border-none bg-slate-200 dark:bg-zinc-800"></div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sold / Reserved</span>
            </div>
          </div>

          {isConcert && event.ticketType !== "free" && (
            <>
              <div className="w-full h-px bg-slate-200 dark:bg-white/10 my-8"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Categories</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border-2 border-pink-500 bg-white dark:bg-zinc-900"></div>
                    <span className="text-pink-600 dark:text-pink-400">VIP</span>
                  </div>
                  <span>₹{Math.round(basePrice * 3)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border-2 border-teal-500 bg-white dark:bg-zinc-900"></div>
                    <span className="text-teal-600 dark:text-teal-400">Gold</span>
                  </div>
                  <span>₹{Math.round(basePrice * 2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border-2 border-blue-500 bg-white dark:bg-zinc-900"></div>
                    <span className="text-blue-600 dark:text-blue-400">GA</span>
                  </div>
                  <span>₹{basePrice}</span>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Seat Canvas */}
        <main className="flex-1 bg-white dark:bg-[#050505] overflow-auto relative p-8">
          <div className="min-w-[500px] max-w-3xl mx-auto pb-32">

            {/* Error Toast */}
            {bookingError && !showBooking && (
              <div className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg p-4 mb-8 text-sm font-bold text-center shadow-lg w-full">
                {bookingError}
              </div>
            )}

            {isConcert ? (
              /* ---------------- Premium Concert Stadium Layout ---------------- */
              <div className="relative w-full max-w-[520px] aspect-square mx-auto mb-16 mt-8 border border-slate-100 dark:border-white/5 rounded-[2rem] bg-slate-50/50 dark:bg-zinc-950/20 p-4 shadow-inner">

                {/* Oval Stadium Center Field */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-24 sm:w-44 sm:h-28 rounded-[100%] bg-emerald-950/30 dark:bg-emerald-950/20 border-2 border-emerald-500/50 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.15)] overflow-hidden z-10">
                  {/* Stadium Track Markings */}
                  <div className="absolute inset-2 border border-emerald-500/30 border-dashed rounded-[100%] flex items-center justify-center">
                    <div className="absolute inset-3 border border-emerald-500/20 rounded-[100%]"></div>
                  </div>
                  {/* Stage Area Platform inside Stadium */}
                  <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-400/40 rounded flex items-center justify-center shadow-md z-20 animate-pulse">
                    <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">STAGE</span>
                  </div>
                  <span className="text-[8px] text-emerald-500/60 font-bold tracking-widest uppercase mt-1 z-20">Stadium Arena</span>
                </div>

                {/* Concentric Stadium Seats */}
                {(() => {
                  // Segment seats into VIP, Gold, General Admission
                  const vipSeats = seats.filter((s) => s.seatNumber <= Math.ceil(totalSeats * 0.15));
                  const goldSeats = seats.filter((s) => s.seatNumber > Math.ceil(totalSeats * 0.15) && s.seatNumber <= Math.ceil(totalSeats * 0.40));
                  const gaSeats = seats.filter((s) => s.seatNumber > Math.ceil(totalSeats * 0.40));

                  const renderSeatRing = (ringSeats, radius) => {
                    const N = ringSeats.length;
                    return ringSeats.map((seat, i) => {
                      const isSelected = selectedSeats.includes(seat.seatNumber);
                      const isAvailable = seat.status === "available";
                      const isReserved = seat.status === "reserved";
                      const isBooked = seat.status === "booked";
                      const isDisabled = !isAvailable && !isSelected;
                      const tierInfo = getSeatTierInfo(seat.seatNumber);
                      const shapeClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded-md';

                      // Calculate position: 115 deg to 425 deg (covers 310 deg arch, leaving gap at bottom)
                      const angle = 115 + (i * (310 / Math.max(1, N - 1)));
                      const rad = (angle * Math.PI) / 180;
                      const x = 50 + radius * Math.cos(rad);
                      const y = 50 + radius * Math.sin(rad);

                      return (
                        <button
                          key={seat._id}
                          disabled={isDisabled}
                          onClick={() => toggleSeat(seat.seatNumber)}
                          title={`Seat ${seat.seatNumber} (${tierInfo.name}) - ₹${tierInfo.price}`}
                          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', position: 'absolute' }}
                          className={`flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold transition-all duration-200 ${shapeClass}
                                       ${isSelected ? 'bg-emerald-500 text-white border-none shadow-lg scale-110 z-20' :
                              isBooked || isReserved ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-none cursor-not-allowed opacity-60' :
                                `bg-white dark:bg-zinc-900 border-[1.5px] ${tierInfo.color} text-slate-500 dark:text-zinc-450 hover:text-primary dark:hover:text-white hover:scale-105 cursor-pointer shadow-sm`}
                                    `}
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    });
                  };

                  return (
                    <>
                      {/* VIP Ring - Inner (radius: 23%) */}
                      {renderSeatRing(vipSeats, 23)}

                      {/* Gold Ring - Middle (radius: 35%) */}
                      {renderSeatRing(goldSeats, 35)}

                      {/* GA Ring - Outer (radius: 46%) */}
                      {renderSeatRing(gaSeats, 46)}
                    </>
                  );
                })()}
              </div>
            ) : (
              /* ---------------- Normal Event Seating Layout (Flat Grid facing front stage) ---------------- */
              <div className="w-full">
                {/* Stage */}
                <div className="w-full flex flex-col items-center mb-16 mt-8">
                  <div className="w-3/4 h-8 border-t-4 border-slate-200 dark:border-zinc-800 rounded-t-[100%]"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 -mt-2">Stage Facing Front</span>
                </div>

                {/* Clean, Simple Seat Grid */}
                <div className="grid gap-3 justify-items-center grid-cols-8 sm:grid-cols-10">
                  {seats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isAvailable = seat.status === "available";
                    const isReserved = seat.status === "reserved";
                    const isBooked = seat.status === "booked";
                    const isDisabled = !isAvailable && !isSelected;

                    const tierInfo = { color: 'border-emerald-500', price: basePrice };
                    const shapeClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded-md';

                    return (
                      <button
                        key={seat._id}
                        disabled={isDisabled}
                        onClick={() => toggleSeat(seat.seatNumber)}
                        title={`Seat ${seat.seatNumber} - ₹${tierInfo.price}`}
                        className={`flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all ${shapeClass}
                                    ${isSelected ? 'bg-emerald-500 text-white border-none shadow-md z-10' :
                            isBooked || isReserved ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-none cursor-not-allowed opacity-60' :
                              `bg-white dark:bg-zinc-900 border-[1.5px] ${tierInfo.color} text-slate-500 dark:text-zinc-450 hover:text-primary dark:hover:text-white cursor-pointer`}
                                 `}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Bottom Booking Bar */}
      <div className="h-24 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/10 flex items-center justify-between px-6 md:px-10 flex-shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
        <div>
          {selectedSeats.length > 0 ? (
            <>
              <p className="text-2xl font-black">₹{totalPrice.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold">₹{basePrice === 0 ? "Free" : basePrice.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Onwards</p>
            </>
          )}
        </div>
        <button
          onClick={handleReserve}
          disabled={selectedSeats.length === 0 || reserving}
          className="bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:text-slate-500 text-white px-12 h-14 rounded-xl font-bold text-sm uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:shadow-none"
        >
          {reserving ? "Processing..." : selectedSeats.length === 0 ? "Select Seats" : "Pay To Book"}
        </button>
      </div>

      {/* ---------------- Checkout / Timer Modal ---------------- */}
      {showBooking && !bookingConfirmed && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#111] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-200 dark:border-zinc-800">
            {/* Timer Progress Bar */}
            <div className="w-full h-1 bg-slate-100 dark:bg-zinc-800">
              <div className="h-full bg-primary transition-all ease-linear" style={{ width: `${(timeLeft / 600) * 100}%` }}></div>
            </div>

            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 mb-6 bg-slate-100 dark:bg-zinc-800 px-4 py-2 rounded-full border border-slate-200 dark:border-zinc-700">
                <svg className="w-4 h-4 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-mono font-bold text-primary">{formatTime(timeLeft)}</span>
              </div>

              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Complete Booking</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
                Your seats are held. Confirm your payment to secure these tickets.
              </p>

              <div className="bg-slate-50 dark:bg-black/50 rounded-2xl p-6 text-left border border-slate-200 dark:border-white/5 mb-8">
                <div className="flex justify-between items-end mb-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                    <p className="font-black text-3xl">₹{totalPrice.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Seats ({selectedSeats.length})</p>
                <p className="text-sm font-semibold">{selectedSeats.join(', ')}</p>
              </div>

              {bookingError && (
                <div className="bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg p-3 mb-6 text-sm font-bold border border-red-500/20">
                  {bookingError}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={reserving}
                className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-widest transition-all cursor-pointer mb-3 shadow-lg hover:-translate-y-0.5"
              >
                {reserving ? "Confirming..." : "Confirm & Pay"}
              </button>
              <button
                onClick={() => setShowBooking(false)}
                className="w-full h-12 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Digital Ticket Success UI ---------------- */}
      {bookingConfirmed && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">

          <div className="bg-white text-black max-w-sm w-full rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.3)] relative animate-fade-in-up">
            {/* Ticket Header */}
            <div className="p-8 border-b-2 border-slate-200 border-dashed relative">
              <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-black rounded-full"></div>
              <div className="absolute -right-4 -bottom-4 w-8 h-8 bg-black rounded-full"></div>

              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">SeatFlow</p>
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>

              <h2 className="text-3xl font-black leading-none mb-6 tracking-tighter uppercase">{event.name}</h2>

              <div className="grid grid-cols-2 gap-6 mb-2">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Date</p>
                  <p className="font-bold text-sm">{eventDate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Time</p>
                  <p className="font-bold text-sm">{event.time}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Tier</p>
                  <p className="font-bold text-sm">{getSeatTiersList(selectedSeats, event)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Quantity</p>
                  <p className="font-bold text-sm">{selectedSeats.length} {selectedSeats.length > 1 ? "Tickets" : "Ticket"}</p>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-8 bg-slate-50">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">
                    {selectedSeats.length > 1 ? "Seats" : "Seat"}
                  </p>
                  <p className="font-black text-xl text-primary">{selectedSeats.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Total Paid</p>
                  <p className="font-black text-xl">₹{totalPrice.toLocaleString()}</p>
                </div>
              </div>

              {/* CSS Barcode */}
              <div className="w-full h-16 bg-[repeating-linear-gradient(90deg,#000,#000_3px,transparent_3px,transparent_6px,#000_6px,#000_7px,transparent_7px,transparent_10px,#000_10px,#000_14px,transparent_14px,transparent_16px)] opacity-90 mb-4 rounded-sm"></div>
              <p className="text-center text-[10px] text-slate-400 tracking-[0.4em] font-mono mb-8 uppercase font-bold">{reservationId}</p>

              <button onClick={() => navigate('/events')} className="w-full h-14 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-lg hover:-translate-y-0.5">
                View All Events
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Mock Razorpay Payment Modal ---------------- */}
      {showMockModal && mockOrder && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 max-w-md w-full rounded-3xl p-8 shadow-2xl relative text-left animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <div>
                <span className="px-2 py-0.5 text-[9px] bg-blue-500/10 text-blue-400 font-bold uppercase rounded border border-blue-500/15 tracking-wider">Sandbox Gateway</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">Razorpay Simulation</h3>
              </div>
            </div>

            <div className="space-y-4 mb-8 bg-black/30 rounded-2xl p-6 border border-white/5 text-sm">
              <div className="flex justify-between pb-3 border-b border-white/5">
                <span className="text-slate-400 font-medium">Event:</span>
                <span className="text-white font-bold truncate max-w-[200px]">{event.name}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-white/5">
                <span className="text-slate-400 font-medium">Seats:</span>
                <span className="text-white font-bold">{selectedSeats.join(', ')}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-white/5">
                <span className="text-slate-400 font-medium">Order ID:</span>
                <span className="text-slate-400 font-mono text-xs">{mockOrder.orderId}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                <span className="text-2xl font-black text-blue-400">₹{mockOrder.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleMockPaymentSuccess}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
              >
                Simulate Successful Payment
              </button>
              <button
                onClick={handleMockPaymentFail}
                className="w-full h-12 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Simulate Failure / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
