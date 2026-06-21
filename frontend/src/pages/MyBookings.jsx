import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

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

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role === "organizer") {
      navigate("/business/dashboard");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const { data } = await API.get("/bookings");
        setBookings(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [navigate, user]);

  if (loading || (user && user.role === "organizer")) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-[#f8fafc] transition-colors duration-200 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16 md:pt-36">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 block">
            Customer Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            My Bookings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            View, print, and manage all your purchased event tickets.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl p-4 text-center border border-red-500/20 font-bold mb-8">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 px-5 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm">
            <div className="text-4xl mb-4">🎟️</div>
            <p className="text-slate-900 dark:text-white text-lg font-bold">No bookings found</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-8">You haven&apos;t booked any tickets yet.</p>
            <Link
              to="/events"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all inline-block shadow-lg shadow-primary/20"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {bookings.map((booking) => {
              const event = booking.eventId || {};
              const eventDate = event.date
                ? new Date(event.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "TBA";

              return (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-zinc-950 text-black border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl max-w-2xl mx-auto flex flex-col md:flex-row animate-fade-in-up"
                >
                  {/* Left/Top Panel - Event Cover & Title */}
                  <div className="w-full md:w-2/5 relative h-48 md:h-auto bg-slate-100 dark:bg-zinc-900 overflow-hidden">
                    <img
                      src={event.coverImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=85"}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/30"></div>
                    <div className="absolute bottom-4 left-4 right-4 md:hidden text-white">
                      <p className="text-xs uppercase font-extrabold tracking-widest text-primary-light mb-1">
                        {event.category || "Event"}
                      </p>
                      <h3 className="text-lg font-black tracking-tight leading-tight truncate">
                        {event.name}
                      </h3>
                    </div>
                  </div>

                  {/* Right Panel - Ticket Stub details */}
                  <div className="w-full md:w-3/5 p-6 flex flex-col justify-between relative bg-white dark:bg-zinc-900/10 dark:text-white">
                    {/* Dashed separators for ticket look */}
                    <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-full z-10"></div>
                    
                    <div className="hidden md:block border-l-2 border-dashed border-slate-200 dark:border-zinc-800 absolute left-0 top-6 bottom-6"></div>

                    <div>
                      <div className="hidden md:flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            SeatFlow Ticket
                          </span>
                          <h3 className="text-xl font-black tracking-tight uppercase leading-tight line-clamp-2 mt-1">
                            {event.name || "Untitled Event"}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 tracking-wider">Date</p>
                          <p className="font-bold">{eventDate}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 tracking-wider">Time</p>
                          <p className="font-bold">{event.time || "TBA"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 tracking-wider">Tier</p>
                          <p className="font-bold">{getSeatTiersList(booking.seatNumbers, event)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 tracking-wider">Quantity</p>
                          <p className="font-bold">{booking.seatNumbers.length} {booking.seatNumbers.length > 1 ? "Tickets" : "Ticket"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 tracking-wider">Venue</p>
                          <p className="font-bold text-xs truncate">
                            {event.venue}{event.city ? `, ${event.city}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-slate-100 dark:border-zinc-800 pt-4 mb-6">
                        <div>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 tracking-wider">
                            {booking.seatNumbers.length > 1 ? "Seats" : "Seat"}
                          </p>
                          <p className="font-black text-lg text-primary">{booking.seatNumbers.join(", ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 tracking-wider">Paid Amount</p>
                          <p className="font-black text-lg">
                            {booking.totalPrice === 0 ? "Free" : `₹${booking.totalPrice.toLocaleString("en-IN")}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Barcode representation */}
                    <div className="mt-auto">
                      <div className="w-full h-12 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_5px,transparent_5px,transparent_8px,#000_8px,#000_11px,transparent_11px,transparent_13px)] dark:bg-[repeating-linear-gradient(90deg,#fff,#fff_2px,transparent_2px,transparent_4px,#fff_4px,#fff_5px,transparent_5px,transparent_8px,#fff_8px,#fff_11px,transparent_11px,transparent_13px)] opacity-90 rounded-xs"></div>
                      <p className="text-center text-[8px] font-mono tracking-[0.4em] uppercase font-bold mt-1 text-slate-450 dark:text-zinc-550 select-all">
                        {booking._id}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
