import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ─── CONSTANTS ─── */
const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Date & Venue" },
  { id: 3, label: "Tickets" },
  { id: 4, label: "Update" },
];

const CATEGORIES = ["Concerts", "Comedy", "Nightlife", "Sports", "Theatre", "Festival", "Workshop", "Conference", "Other"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

const initialForm = {
  eventName: "", category: "", description: "", coverImage: "",
  date: "", time: "", city: "", venue: "", address: "",
  ticketType: "paid", ticketPrice: "", totalSeats: "",
  earlyBirdEnabled: false, earlyBirdPrice: "", earlyBirdSeats: "",
  organizerName: "", organizerEmail: "", organizerPhone: "", agreeTerms: true,
};

/* ─── CUSTOM INPUT COMPONENTS ─── */
function Input({ label, required, hint, id, className = "", ...props }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full h-11 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-lg px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-650 text-sm outline-none transition-all duration-150 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900/90 ${className}`}
      />
      {hint && <p className="text-[11px] text-slate-400 dark:text-zinc-550 mt-1.5">{hint}</p>}
    </div>
  );
}

function Textarea({ label, required, hint, id, rows = 5, className = "", ...props }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        {...props}
        className={`w-full bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-650 text-sm outline-none transition-all duration-150 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900/90 resize-y min-h-[100px] leading-relaxed ${className}`}
      />
      {hint && <p className="text-[11px] text-slate-400 dark:text-zinc-550 mt-1.5">{hint}</p>}
    </div>
  );
}

function Select({ label, required, id, children, className = "", ...props }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          {...props}
          className={`w-full h-11 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-lg px-4 pr-10 text-slate-900 dark:text-white text-sm outline-none cursor-pointer appearance-none transition-all duration-150 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900/90 ${className}`}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-slate-400 dark:text-zinc-550">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP INDICATOR ─── */
function StepBar({ current }) {
  return (
    <div className="flex items-center justify-between mb-10 w-full overflow-x-auto py-2">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none min-w-[90px] last:min-w-0">
            <div className="flex flex-col items-center gap-2 relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${done || active
                    ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-black shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500"
                  }`}
              >
                {done ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${active
                    ? "text-slate-900 dark:text-white"
                    : done
                      ? "text-slate-500 dark:text-zinc-400"
                      : "text-slate-400 dark:text-zinc-650"
                  }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-4 -mt-5 transition-colors duration-500 ${done ? "bg-slate-900 dark:bg-white" : "bg-slate-250 dark:bg-zinc-800"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN ─── */
export default function EditEvent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Redirect if not logged in or not organizer
  useEffect(() => {
    if (!authLoading) {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/business/login");
        return;
      }
      if (user && user.role !== "organizer") {
        navigate("/bookings");
        return;
      }
    }
  }, [authLoading, navigate, user]);

  // Load event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/events/${id}`);
        
        // Format the date to YYYY-MM-DD
        const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : "";
        
        setForm({
          eventName: data.name || "",
          category: data.category || "",
          description: data.description || "",
          coverImage: data.coverImage || "",
          date: formattedDate,
          time: data.time || "",
          city: data.city || "",
          venue: data.venue || "",
          address: data.address || "",
          ticketType: data.ticketType || "paid",
          ticketPrice: data.ticketPrice || "",
          totalSeats: data.totalSeats || "",
          earlyBirdEnabled: data.earlyBirdEnabled || false,
          earlyBirdPrice: data.earlyBirdPrice || "",
          earlyBirdSeats: data.earlyBirdSeats || "",
          organizerName: data.organizerName || "",
          organizerEmail: data.organizerEmail || "",
          organizerPhone: data.organizerPhone || "",
          agreeTerms: true,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (authLoading || !localStorage.getItem("token") || loading || (user && user.role !== "organizer")) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-bold">{error}</p>
        <Link to="/business/dashboard" className="text-primary hover:underline text-sm font-bold">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k) => setForm((f) => ({ ...f, [k]: !f[k] }));

  const canNext = () => {
    if (step === 1) return form.eventName.trim() && form.category && form.description.trim();
    if (step === 2) return form.date && form.time && form.city && form.venue.trim();
    if (step === 3) return form.totalSeats && (form.ticketType === "free" || form.ticketPrice);
    if (step === 4) return form.organizerName.trim() && form.organizerEmail.trim() && form.agreeTerms;
    return true;
  };

  const progress = (step / 4) * 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canNext()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        eventName: form.eventName,
        category: form.category,
        description: form.description,
        coverImage: form.coverImage,
        date: form.date,
        time: form.time,
        city: form.city,
        venue: form.venue,
        address: form.address,
        ticketType: form.ticketType,
        ticketPrice: form.ticketType === "free" ? 0 : Number(form.ticketPrice),
        totalSeats: Number(form.totalSeats),
        earlyBirdEnabled: form.earlyBirdEnabled,
        earlyBirdPrice: form.earlyBirdEnabled ? Number(form.earlyBirdPrice) : undefined,
        earlyBirdSeats: form.earlyBirdEnabled ? Number(form.earlyBirdSeats) : undefined,
        organizerName: form.organizerName,
        organizerEmail: form.organizerEmail,
        organizerPhone: form.organizerPhone,
      };

      await API.put(`/events/${id}`, payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to update event. Please check details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-200">
        <Navbar />
        <div className="flex items-center justify-center min-h-[75vh] px-4 py-10">
          <div className="text-center max-w-md bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md animate-fade-in-up">
            <div className="text-5xl mb-6">✏️</div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Event Updated!
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
              Your changes to <span className="font-semibold text-slate-900 dark:text-white">&ldquo;{form.eventName}&rdquo;</span> have been saved successfully.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/business/dashboard"
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                Go Dashboard
              </Link>
              <Link
                to={`/events/${id}`}
                className="px-6 py-2.5 bg-transparent border border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded-lg font-bold text-sm transition-all"
              >
                View Listing
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar />

      {/* Progress bar */}
      <div className="h-[2px] bg-slate-200 dark:bg-zinc-900 w-full">
        <div
          className="h-full bg-primary transition-all duration-400 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 mb-3">
            <Link to="/business/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Dashboard
            </Link>
            <span>/</span>
            <span>Edit Event</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-center">
            Edit Event Listings
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base text-center">
            Update date, venue, or ticket allocations for your listing.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <StepBar current={step} />

          <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md">
            {/* Step 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Update event branding and metadata.</p>
                </div>
                <Input
                  id="event-name"
                  label="Event Name"
                  required
                  type="text"
                  placeholder="e.g. Coldplay Mumbai Live 2027"
                  value={form.eventName}
                  onChange={(e) => set("eventName", e.target.value)}
                />
                <Select
                  id="event-category"
                  label="Category"
                  required
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                <Textarea
                  id="event-desc"
                  label="Description"
                  required
                  rows={5}
                  hint="Describe the vibe, lineup, and experience."
                  placeholder="Tell attendees what to expect..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
                <Input
                  id="event-image"
                  label="Cover Image URL"
                  type="url"
                  hint="Paste direct image link (1920x1080 recommended)."
                  placeholder="https://..."
                  value={form.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                />
                {form.coverImage && (
                  <div className="rounded-xl overflow-hidden h-40 bg-slate-200 dark:bg-zinc-900 border border-slate-350 dark:border-zinc-800">
                    <img
                      src={form.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Date &amp; Venue</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Update schedule and location details.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="event-date"
                    label="Date"
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                  <Input
                    id="event-time"
                    label="Time"
                    required
                    type="time"
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                  />
                </div>
                <Select
                  id="event-city"
                  label="City"
                  required
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                >
                  <option value="">Select city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                <Input
                  id="event-venue"
                  label="Venue Name"
                  required
                  type="text"
                  placeholder="e.g. JLN Stadium"
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                />
                <Textarea
                  id="event-address"
                  label="Full Address"
                  rows={3}
                  placeholder="Street, PIN..."
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tickets &amp; Pricing</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Set capacity adjustments and base rates.</p>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Ticket Type <span className="text-primary">*</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ v: "free", label: "Free" }, { v: "paid", label: "Paid" }].map(({ v, label }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => set("ticketType", v)}
                        className={`h-11 rounded-lg border text-sm font-bold transition-all cursor-pointer ${form.ticketType === v
                            ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-md"
                            : "bg-transparent text-slate-500 dark:text-zinc-550 border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.ticketType === "paid" && (
                  <div className="relative">
                    <Input
                      id="ticket-price"
                      label="Ticket Price (₹)"
                      required
                      type="number"
                      min="1"
                      className="pl-8"
                      placeholder="1499"
                      value={form.ticketPrice}
                      onChange={(e) => set("ticketPrice", e.target.value)}
                    />
                    <span className="absolute left-4 bottom-[13px] text-slate-400 dark:text-zinc-550 text-sm font-semibold">
                      ₹
                    </span>
                  </div>
                )}

                <Input
                  id="total-seats"
                  label="Total Seats"
                  required
                  type="number"
                  min="1"
                  hint="Adjust ticket capacity. Note: You cannot decrease total seats below currently booked or held seats."
                  placeholder="500"
                  value={form.totalSeats}
                  onChange={(e) => set("totalSeats", e.target.value)}
                />

                {form.ticketType === "paid" && (
                  <div className="border border-slate-200 dark:border-zinc-850 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-900/10">
                    <div className={`flex items-center justify-between ${form.earlyBirdEnabled ? "mb-4" : ""}`}>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Early Bird Pricing</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Discounted rate details.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle("earlyBirdEnabled")}
                        className={`w-11 h-6 rounded-full relative transition-all duration-200 ${form.earlyBirdEnabled ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-zinc-800"
                          }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full absolute top-1 transition-all duration-200 ${form.earlyBirdEnabled
                              ? "bg-white dark:bg-black left-[22px]"
                              : "bg-slate-400 dark:bg-zinc-500 left-1"
                            }`}
                        />
                      </button>
                    </div>
                    {form.earlyBirdEnabled && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                        <Input
                          id="early-bird-price"
                          label="Early Bird Price (₹)"
                          type="number"
                          min="1"
                          placeholder="999"
                          value={form.earlyBirdPrice}
                          onChange={(e) => set("earlyBirdPrice", e.target.value)}
                        />
                        <Input
                          id="early-bird-seats"
                          label="Early Bird Seats"
                          type="number"
                          min="1"
                          placeholder="50"
                          value={form.earlyBirdSeats}
                          onChange={(e) => set("earlyBirdSeats", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review &amp; Update</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Review changes before updating listing.</p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-850 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-900">
                  {[
                    { label: "Event", value: form.eventName },
                    { label: "Category", value: form.category },
                    { label: "Schedule", value: `${form.date} at ${form.time}` },
                    { label: "Venue", value: `${form.venue}, ${form.city}` },
                    { label: "Tickets", value: form.ticketType === "paid" ? `₹${form.ticketPrice} · ${form.totalSeats} seats` : `Free · ${form.totalSeats} seats` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3 px-4 bg-slate-50/20 dark:bg-zinc-950/20">
                      <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{label}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white text-right max-w-[60%] truncate">{value || "—"}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-5 pt-2">
                  <p className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-zinc-550 mb-1">Organizer Contact</p>
                  <Input
                    id="organizer-name"
                    label="Full Name"
                    required
                    type="text"
                    placeholder="Your name"
                    value={form.organizerName}
                    onChange={(e) => set("organizerName", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      id="organizer-email"
                      label="Email"
                      required
                      type="email"
                      placeholder="you@company.com"
                      value={form.organizerEmail}
                      onChange={(e) => set("organizerEmail", e.target.value)}
                    />
                    <Input
                      id="organizer-phone"
                      label="Phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.organizerPhone}
                      onChange={(e) => set("organizerPhone", e.target.value)}
                    />
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-650 dark:text-red-300 rounded-lg p-3 text-xs md:text-sm mt-2">
                    {submitError}
                  </div>
                )}
              </div>
            )}

            {/* Form Footer Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className={`h-10 px-5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold text-sm hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${step === 1 ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
              >
                ← Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => { if (canNext()) setStep((s) => s + 1); }}
                  disabled={!canNext()}
                  className={`h-10 px-6 rounded-lg font-bold text-sm transition-all ${canNext() ? "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 cursor-pointer" : "bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-650 border border-slate-200 dark:border-zinc-850 cursor-not-allowed"}`}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canNext() || isSubmitting}
                  className={`h-10 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${canNext() && !isSubmitting ? "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 cursor-pointer" : "bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-650 border border-slate-200 dark:border-zinc-850 cursor-not-allowed"}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
