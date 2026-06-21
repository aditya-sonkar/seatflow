import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ─── CONSTANTS ─── */
const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Date & Venue" },
  { id: 3, label: "Tickets" },
  { id: 4, label: "Publish" },
];

const CATEGORIES = ["Concerts", "Comedy", "Nightlife", "Sports", "Theatre", "Festival", "Workshop", "Conference", "Other"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

const WHY_ITEMS = [
  { icon: "₹0", label: "Zero listing fee", desc: "Free to publish, we take a small % per ticket." },
  { icon: "48h", label: "Fast payouts", desc: "Revenue transferred within 48h of event end." },
  { icon: "10K+", label: "Monthly visitors", desc: "Reach an engaged audience of event-goers." },
  { icon: "24/7", label: "Support", desc: "Dedicated organizer support at all times." },
];

const initialForm = {
  eventName: "", category: "", description: "", coverImage: "",
  date: "", time: "", city: "", venue: "", address: "",
  ticketType: "paid", ticketPrice: "", totalSeats: "",
  earlyBirdEnabled: false, earlyBirdPrice: "", earlyBirdSeats: "",
  organizerName: "", organizerEmail: "", organizerPhone: "", agreeTerms: false,
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
      {hint && <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">{hint}</p>}
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
      {hint && <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">{hint}</p>}
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
export default function HostEvent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
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

  // Pre-fill organizer name and email if user profile is loaded
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        organizerName: f.organizerName || user.name || "",
        organizerEmail: f.organizerEmail || user.email || "",
      }));
    }
  }, [user]);

  // Prevent flash of page before redirect
  if (authLoading || !localStorage.getItem("token") || (user && user.role !== "organizer")) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
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

      await API.post("/events", payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to publish event. Please check details and try again.");
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
            <div className="text-5xl mb-6">🎉</div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Event Submitted!
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed mb-1">
              <span className="font-semibold text-slate-900 dark:text-white">&ldquo;{form.eventName}&rdquo;</span> is under review.
            </p>
            <p className="text-slate-400 dark:text-zinc-500 text-xs mb-8">
              We&apos;ll get back to <span className="font-semibold">{form.organizerEmail}</span> within 24 hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/events"
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                Browse Events
              </Link>
              <Link
                to="/"
                className="px-6 py-2.5 bg-transparent border border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded-lg font-bold text-sm transition-all"
              >
                Go Home
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
            <Link to="/events" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Events
            </Link>
            <span>/</span>
            <span>Host Event</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-center">
            List your Event
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base text-center">
            Fill out the details below to publish your event on SeatFlow.
          </p>
        </div>

        {/* Centered Focused Layout */}
        <div className="max-w-3xl mx-auto">
          {/* ── FORM ── */}
          <div className="w-full">
            <StepBar current={step} />

            {/* Form card */}
            <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md">
              {/* ─ STEP 1 ─ */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Tell us about your event.</p>
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
                    <option value="" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                        {c}
                      </option>
                    ))}
                  </Select>
                  <Textarea
                    id="event-desc"
                    label="Description"
                    required
                    rows={5}
                    hint="Describe the vibe, lineup, and experience. Be specific."
                    placeholder="Tell attendees what to expect — the lineup, atmosphere, timings..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                  <Input
                    id="event-image"
                    label="Cover Image URL"
                    type="url"
                    hint="Paste a direct image link (1920×1080 recommended)."
                    placeholder="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80"
                    value={form.coverImage}
                    onChange={(e) => set("coverImage", e.target.value)}
                  />
                  {form.coverImage && (
                    <div className="rounded-xl overflow-hidden h-40 bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800">
                      <img
                        src={form.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ─ STEP 2 ─ */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Date &amp; Venue</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">When and where is your event?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      id="event-date"
                      label="Date"
                      required
                      type="date"
                      className="dark:color-scheme-dark"
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                    />
                    <Input
                      id="event-time"
                      label="Time"
                      required
                      type="time"
                      className="dark:color-scheme-dark"
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
                    <option value="" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                        {c}
                      </option>
                    ))}
                  </Select>
                  <Input
                    id="event-venue"
                    label="Venue Name"
                    required
                    type="text"
                    placeholder="e.g. JLN Stadium, Palace Grounds"
                    value={form.venue}
                    onChange={(e) => set("venue", e.target.value)}
                  />
                  <Textarea
                    id="event-address"
                    label="Full Address"
                    rows={3}
                    placeholder="Street, area, city, PIN..."
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </div>
              )}

              {/* ─ STEP 3 ─ */}
              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tickets &amp; Pricing</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Set your ticket type and availability.</p>
                  </div>

                  {/* Ticket Type Toggle */}
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                      Ticket Type <span className="text-primary">*</span>
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ v: "free", label: "Free" }, { v: "paid", label: "Paid" }].map(({ v, label }) => (
                        <button
                          key={v}
                          type="button"
                          id={`ticket-type-${v}`}
                          onClick={() => set("ticketType", v)}
                          className={`h-11 rounded-lg border text-sm font-bold transition-all cursor-pointer ${form.ticketType === v
                              ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-md"
                              : "bg-transparent text-slate-500 dark:text-zinc-550 border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 hover:text-slate-700 dark:hover:text-zinc-300"
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
                      <span className="absolute left-4 bottom-[13px] text-slate-400 dark:text-zinc-500 text-sm font-semibold pointer-events-none">
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
                    hint="Maximum number of tickets to sell."
                    placeholder="500"
                    value={form.totalSeats}
                    onChange={(e) => set("totalSeats", e.target.value)}
                  />

                  {form.ticketType === "paid" && (
                    <div className="border border-slate-200 dark:border-zinc-850 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-900/10">
                      <div className={`flex items-center justify-between ${form.earlyBirdEnabled ? "mb-4" : ""}`}>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Early Bird Pricing</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">Offer a discount to early buyers.</p>
                        </div>
                        <button
                          type="button"
                          id="toggle-early-bird"
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

              {/* ─ STEP 4 ─ */}
              {step === 4 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review &amp; Publish</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Check your details and submit.</p>
                  </div>

                  {/* Summary Table */}
                  <div className="border border-slate-200 dark:border-zinc-850 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-900">
                    {[
                      { label: "Event", value: form.eventName },
                      { label: "Category", value: form.category },
                      { label: "Date & Time", value: form.date && form.time ? `${form.date} at ${form.time}` : "—" },
                      { label: "Venue", value: form.venue ? `${form.venue}, ${form.city}` : "—" },
                      { label: "Tickets", value: form.ticketType === "paid" ? `₹${form.ticketPrice} · ${form.totalSeats} seats` : `Free · ${form.totalSeats} seats` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-3 px-4 bg-slate-50/20 dark:bg-zinc-950/20">
                        <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{label}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white text-right max-w-[60%] truncate">{value || "—"}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-5 pt-2">
                    <p className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Organizer Contact</p>
                    <Input
                      id="organizer-name"
                      label="Full Name"
                      required
                      type="text"
                      placeholder="Your full name"
                      value={form.organizerName}
                      onChange={(e) => set("organizerName", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        id="organizer-email"
                        label="Email"
                        required
                        type="email"
                        placeholder="you@example.com"
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

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer mt-2" id="label-agree-terms">
                    <button
                      type="button"
                      id="checkbox-agree-terms"
                      onClick={() => toggle("agreeTerms")}
                      className={`w-[18px] h-[18px] rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${form.agreeTerms
                          ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-black"
                          : "bg-transparent border-slate-300 dark:border-zinc-700 hover:border-slate-450 dark:hover:border-zinc-500"
                        }`}
                    >
                      {form.agreeTerms && (
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="text-slate-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed select-none">
                      I agree to SeatFlow&apos;s <a href="#" className="text-slate-900 dark:text-white underline hover:text-primary transition-colors">Terms of Service</a> and confirm this event complies with local regulations.
                    </span>
                  </label>

                  {/* Error Box */}
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-650 dark:text-red-200 rounded-lg p-3 text-xs md:text-sm mt-2 animate-fade-in-up">
                      {submitError}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-zinc-900">
                <button
                  type="button"
                  id="btn-prev-step"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className={`h-10 px-5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold text-sm hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${step === 1 ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
                    }`}
                >
                  ← Back
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    id="btn-next-step"
                    onClick={() => {
                      if (canNext()) setStep((s) => s + 1);
                    }}
                    disabled={!canNext()}
                    className={`h-10 px-6 rounded-lg font-bold text-sm transition-all ${canNext()
                        ? "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 cursor-pointer"
                        : "bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 border border-slate-250 dark:border-zinc-800/80 cursor-not-allowed"
                      }`}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-submit-event"
                    onClick={handleSubmit}
                    disabled={!canNext() || isSubmitting}
                    className={`h-10 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${canNext() && !isSubmitting
                        ? "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 cursor-pointer"
                        : "bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 border border-slate-250 dark:border-zinc-800/80 cursor-not-allowed"
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-zinc-600 dark:border-t-black rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Event →"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Help Support Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Need help? Our organizer support is available 24/7 at{" "}
              <a href="mailto:organizers@seatflow.in" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                organizers@seatflow.in
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
