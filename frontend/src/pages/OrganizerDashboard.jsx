import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/business/login");
        return;
      }
      
      if (user && user.role !== "organizer") {
        navigate("/bookings");
        return;
      }

      const { data } = await API.get("/events/organizer");
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "organizer") {
      navigate("/bookings");
      return;
    }
    fetchEvents();
  }, [navigate, user]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.delete(`/events/${deleteId}`);
      setEvents(events.filter((e) => e._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || (user && user.role !== "organizer")) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate high-level stats
  const totalEvents = events.length;
  const totalTicketsSold = events.reduce((sum, e) => sum + (e.bookedSeats || 0), 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-[#f8fafc] transition-colors duration-200 pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16 md:pt-36">
        {/* Title and Top CTA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 block">
              Partner Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage your live listings, track sales performance, and create new experiences.
            </p>
          </div>
          <Link
            to="/host-event"
            className="self-start md:self-center px-6 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md hover:-translate-y-0.5"
          >
            + Create Event
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Stat 1 */}
          <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-450 dark:text-zinc-550 uppercase tracking-widest mb-1">
              Events Hosted
            </p>
            <p className="text-3xl font-black">{totalEvents}</p>
          </div>
          {/* Stat 2 */}
          <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-450 dark:text-zinc-550 uppercase tracking-widest mb-1">
              Tickets Booked
            </p>
            <p className="text-3xl font-black">{totalTicketsSold}</p>
          </div>
          {/* Stat 3 */}
          <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-450 dark:text-zinc-550 uppercase tracking-widest mb-1">
              Total Revenue
            </p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Listings Section */}
        <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Your Event Listings</h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 text-red-650 rounded-xl p-4 text-center border border-red-500/20 font-bold">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 font-semibold mb-4">No events created yet.</p>
              <Link to="/host-event" className="text-primary hover:underline text-sm font-bold">
                List your first event now →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] uppercase font-bold tracking-widest text-slate-455 dark:text-zinc-500">
                    <th className="py-4 pr-4">Event Details</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4">Sales Progress</th>
                    <th className="py-4 px-4 text-right">Revenue</th>
                    <th className="py-4 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850 text-sm">
                  {events.map((event) => {
                    const soldPct = event.totalSeats > 0 ? Math.round((event.bookedSeats / event.totalSeats) * 100) : 0;
                    const eventDate = event.date
                      ? new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                      : "TBA";

                    return (
                      <tr key={event._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/20">
                        {/* Event details */}
                        <td className="py-4 pr-4 max-w-[200px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.coverImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=150&q=80"}
                              alt={event.name}
                              className="w-12 h-12 object-cover rounded-lg shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{event.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {eventDate} | {event.venue}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                            Approved
                          </span>
                        </td>

                        {/* Sales Progress */}
                        <td className="py-4 px-4 min-w-[150px]">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span>{event.bookedSeats} / {event.totalSeats} booked</span>
                            <span>{soldPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${soldPct}%` }}></div>
                          </div>
                        </td>

                        {/* Revenue */}
                        <td className="py-4 px-4 font-black text-right">
                          ₹{(event.revenue || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 text-right font-semibold">
                          <div className="flex justify-end gap-3 text-xs">
                            <button
                              onClick={() => navigate(`/business/events/${event._id}/edit`)}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(event._id)}
                              className="px-3.5 py-1.5 rounded-lg border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Delete Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200 dark:border-zinc-800 shadow-2xl">
            <div className="text-3xl mb-4 text-red-500">⚠️</div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight text-slate-900 dark:text-white">Delete Listing?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
              This action is permanent. All tickets, seats, and reservation logs for this event will be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 h-11 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-slate-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-lg shadow-red-500/10"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
