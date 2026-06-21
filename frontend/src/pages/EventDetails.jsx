import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import API from "../services/api";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch event data from backend
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 text-lg font-semibold mb-2">
              {error || "Event not found"}
            </p>
            <button
              onClick={() => navigate("/events")}
              className="text-primary hover:underline text-sm font-semibold cursor-pointer"
            >
              ← Back to Events
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Derive seat info from backend response
  const seats = event.seats || [];
  const totalSeats = event.totalSeats || seats.length;
  const availableSeats = seats.filter((s) => s.status === "available").length;
  const bookedSeats = seats.filter((s) => s.status === "booked").length;

  // Format date
  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
    : "TBA";
  const eventTime = event.time || "TBA";

  // Determine status badge
  const fillPercent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
  const statusText =
    fillPercent >= 90 ? "Almost Sold Out" :
    fillPercent >= 70 ? "Selling Fast" :
    fillPercent >= 50 ? `${fillPercent}% Filled` :
    "Available";

  const basePrice = event.ticketType === "free" ? 0 : (event.ticketPrice || 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-200 pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Image Section */}
        <div className="rounded-2xl overflow-hidden mb-12 h-80 md:h-[450px] bg-slate-100 dark:bg-neutral-900 shadow-md">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 dark:from-zinc-900 dark:to-zinc-800">
              <span className="text-slate-400 dark:text-slate-600 text-lg font-semibold">No Cover Image</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-primary text-sm font-bold uppercase tracking-wider mb-2">
                  {event.category || "Event"}
                </div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 tracking-tight">
                  {event.name}
                </h1>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-primary text-sm font-bold whitespace-nowrap">
                {statusText}
              </div>
            </div>

            {/* Event Meta */}
            <div className="space-y-3 text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date & Time</p>
                  <span className="text-lg text-slate-900 dark:text-white font-bold">{eventDate} at {eventTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Venue</p>
                  <span className="text-lg text-slate-900 dark:text-white font-bold">{event.venue}{event.city ? `, ${event.city}` : ""}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h2 className="text-2xl font-black mb-6">About This Event</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-zinc-900/30 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <p>{event.description || "No description available for this event. Come join us for an amazing experience!"}</p>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-slate-100 dark:bg-zinc-900 rounded-2xl p-8 mb-10">
             <h3 className="font-bold text-lg mb-4">Terms & Conditions</h3>
             <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside">
                <li>Please carry a valid ID proof along with you.</li>
                <li>No refunds on purchased ticket are possible, even in case of any rescheduling.</li>
                <li>Security procedures, including frisking remain the right of the management.</li>
                <li>No dangerous or potentially hazardous objects will be allowed in the venue.</li>
             </ul>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Booking Bar (BookMyShow Style) */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-40 py-4 px-6 transition-all">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tickets Starting From</p>
               <p className="text-2xl font-black">{basePrice === 0 ? "Free" : `₹${basePrice}`}</p>
            </div>
            
            <button
               onClick={() => navigate(`/events/${id}/book`)}
               disabled={availableSeats === 0}
               className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
               {availableSeats === 0 ? "Sold Out" : "Book Tickets"}
            </button>
         </div>
      </div>

      <Footer />
    </div>
  );
}
