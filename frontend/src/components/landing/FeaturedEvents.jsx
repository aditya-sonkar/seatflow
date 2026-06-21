import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "concerts", label: "Concerts" },
  { id: "comedy", label: "Comedy" },
  { id: "nightlife", label: "Nightlife" }
];

export default function FeaturedEvents() {
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get("/events");
        setEvents(data);
      } catch (error) {
        console.error("Error fetching featured events:", error);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    // Normalise events list from database model to JSX keys
    const normalized = events.map((e) => ({
      id: e._id,
      title: e.name,
      category: e.category?.toLowerCase() || "",
      date: new Date(e.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      venue: `${e.venue}, ${e.city}`,
      price: e.ticketPrice?.toLocaleString("en-IN") || "0",
      image: e.coverImage || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
      badge: e.totalSeats < 45 ? "Limited Seats" : "Selling Fast"
    }));

    // Map tab IDs (e.g. 'concerts') to singular matching category tags
    const getNormalizedTab = (tab) => {
      if (tab === "concerts") return "concert";
      return tab;
    };

    const targetCategory = getNormalizedTab(activeTab);

    if (activeTab === "all") return normalized.slice(0, 4); // Limit to top 4 events on landing page

    return normalized
      .filter((event) => event.category.includes(targetCategory))
      .slice(0, 4); // Limit to top 4 events in category
  }, [activeTab, events]);

  return (
    <section className="relative bg-slate-50 dark:bg-black overflow-hidden pt-24 pb-32 border-b border-slate-200 dark:border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">

        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white uppercase">
            Popular <span className="text-primary italic font-light tracking-normal lowercase">Events</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Discover and book the best events happening near you.
          </p>
        </div>

        {/* Modern Filter Pills */}
        <div className="flex gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-8 py-3.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border-2 ${activeTab === cat.id
                  ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105'
                  : 'bg-white dark:bg-zinc-900/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-zinc-800 hover:border-primary/50 hover:text-primary dark:hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredEvents.map((event) => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              className="group card overflow-hidden flex flex-col h-full cursor-pointer bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative w-full h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Floating Tags */}
                {event.badge && (
                  <div className="absolute top-3 left-3 bg-white dark:bg-black text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {event.badge}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm animate-pulse">
                  {event.date}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-5 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="truncate">{event.venue}</span>
                </div>

                {/* Footer Area */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-0.5">From</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">₹{event.price}</p>
                  </div>
                  <button className="px-5 py-2 bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white font-semibold rounded-lg text-sm hover:bg-primary hover:text-white transition-colors">
                    Book →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
