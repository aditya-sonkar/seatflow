import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import API from "../services/api";

const TRENDING_VENUES = [
  {
    id: 1,
    name: "DY Patil Stadium",
    city: "Mumbai",
    capacity: "55,000",
    upcoming: 4,
    image: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 2,
    name: "JLN Stadium",
    city: "Delhi",
    capacity: "75,000",
    upcoming: 3,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 3,
    name: "Palace Grounds",
    city: "Bangalore",
    capacity: "30,000",
    upcoming: 5,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 4,
    name: "NCPA Tata Theatre",
    city: "Mumbai",
    capacity: "1,010",
    upcoming: 7,
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 5,
    name: "Bharat Mandapam",
    city: "Delhi",
    capacity: "7,000",
    upcoming: 2,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: 6,
    name: "MMRDA Grounds",
    city: "Mumbai",
    capacity: "50,000",
    upcoming: 6,
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=85",
  },
];

const GENRES = ["All Genres", "Concerts", "Comedy", "Nightlife", "Sports", "Theatre", "Festival"];
const CITIES = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

const SearchIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-slate-400 dark:text-slate-500">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const LocationIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-slate-400 dark:text-slate-500">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-slate-400 dark:text-slate-500">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-slate-400 dark:text-slate-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function Events() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "All Cities");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [genre, setGenre] = useState(searchParams.get("category") || "All Genres");

  // Backend data
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/events");
        setEvents(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    let res = events;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      res = res.filter((e) =>
        (e.name || "").toLowerCase().includes(kw) ||
        (e.venue || "").toLowerCase().includes(kw) ||
        (e.category || "").toLowerCase().includes(kw)
      );
    }
    if (city !== "All Cities") res = res.filter((e) => e.city === city);
    if (genre !== "All Genres") res = res.filter((e) => e.category === genre);
    if (startDate) {
      res = res.filter((e) => {
        const eventDate = e.date ? new Date(e.date).toISOString().split("T")[0] : "";
        return eventDate >= startDate;
      });
    }
    if (endDate) {
      res = res.filter((e) => {
        const eventDate = e.date ? new Date(e.date).toISOString().split("T")[0] : "";
        return eventDate <= endDate;
      });
    }
    return res;
  }, [events, keyword, city, genre, startDate, endDate]);

  const filteredVenues = useMemo(() => {
    let res = TRENDING_VENUES;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      res = res.filter(v => 
        (v.name || "").toLowerCase().includes(kw) || 
        (v.city || "").toLowerCase().includes(kw)
      );
    }
    if (city !== "All Cities") res = res.filter(v => v.city === city);
    return res;
  }, [keyword, city]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 inline-block">SeatFlow Events</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            Find Your Next Experience
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            Browse through verified concerts, comedy shows, nightlife parties, and local festivals.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-200/50 dark:bg-slate-800/50 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700">
            {[
              { id: "events", label: "Popular Events" },
              { id: "venues", label: "Trending Venues" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                id={`tab-${tab.id}`}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600"
                    : "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 mb-12 animate-fade-in-up border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative flex items-center lg:col-span-2">
              <div className="absolute left-4 pointer-events-none text-slate-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search by Event Name or Venue"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                id="events-search-input"
                className="form-input w-full h-12 pl-11"
              />
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-slate-400 z-10">
                <LocationIcon />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                id="events-city-filter"
                className="form-input w-full h-12 pl-11"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative flex items-center">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                id="events-genre-filter"
                className="form-input w-full h-12 px-4"
              >
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            
            <div className="relative flex items-center md:col-span-2 lg:col-span-4 gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                id="events-start-date"
                className="form-input w-full h-12"
                style={{ colorScheme: "inherit" }}
              />
              <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold shrink-0">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                id="events-end-date"
                className="form-input w-full h-12"
                style={{ colorScheme: "inherit" }}
              />
            </div>
          </div>
        </div>

        {activeTab === "events" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {loading ? "Loading events..." : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}
              </span>
              {(keyword || city !== "All Cities" || genre !== "All Genres" || startDate || endDate) && (
                <button
                  onClick={() => { setKeyword(""); setCity("All Cities"); setGenre("All Genres"); setStartDate(""); setEndDate(""); }}
                  className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer"
                  id="events-clear-filters"
                >
                  Clear filters
                </button>
              )}
            </div>

            {error && (
              <div className="text-center py-10">
                <p className="text-red-500 text-sm font-semibold">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 px-5 card">
                <p className="text-slate-900 dark:text-white text-lg font-bold">No events match your filters.</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((event) => (
                  <EventCard key={event._id} event={event} navigate={navigate} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "venues" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVenues.length === 0 ? (
              <div className="col-span-full text-center py-20 px-5 card">
                <p className="text-slate-900 dark:text-white text-lg font-bold">No trending venues match your filters.</p>
              </div>
            ) : (
              filteredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function EventCard({ event, navigate }) {
  // Map backend fields
  const title = event.name || event.title || "Untitled Event";
  const date = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
    : "TBA";
  const price = event.ticketType === "free" ? 0 : (event.ticketPrice || 0);
  const venue = event.venue || "TBA";
  const city = event.city || "";
  const category = event.category || "Event";
  const image = event.coverImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=85";
  const available = event.availableSeats ?? event.totalSeats ?? 0;
  const total = event.totalSeats || 0;
  const fillPct = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const badge = fillPct >= 90 ? "Almost Sold Out" : fillPct >= 70 ? "Selling Fast" : fillPct >= 50 ? `${fillPct}% Filled` : null;

  return (
    <article
      id={`event-card-${event._id}`}
      className="card group overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-card-hover"
      onClick={() => navigate(`/events/${event._id}`)}
    >
      <div className="relative w-full h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=85" }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {badge && (
          <div className="absolute top-3 left-3 bg-white dark:bg-black text-slate-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {badge}
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
          {date}
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        <div className="flex flex-col gap-1.5 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="truncate">{venue}{city ? `, ${city}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-md">
              {category}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-0.5">From</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
            Book →
          </button>
        </div>
      </div>
    </article>
  );
}

function VenueCard({ venue }) {
  return (
    <article
      id={`venue-card-${venue.id}`}
      className="card group overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-card-hover"
    >
      <div className="relative w-full h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={venue.image}
          alt={venue.name}
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=600&q=85" }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
        }} />
        <div className="absolute bottom-3 left-3">
          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-md">
            {venue.upcoming} upcoming events
          </div>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold mb-2">{venue.name}</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {venue.city}
          </div>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cap. {venue.capacity}</span>
        </div>
      </div>
    </article>
  );
}
