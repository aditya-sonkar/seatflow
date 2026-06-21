import { useState } from "react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section className="section-container">
      <div className="card py-16 px-6 md:px-12 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Get Notified About <span className="text-primary">Hot Events</span>
        </h2>
        
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-medium">
          Join thousands of event lovers. Subscribe to get early access to tickets, presale codes, and lineup announcements.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto mb-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            className="form-input flex-1 text-sm py-3 px-4"
          />
          <button type="submit" className="btn-primary text-sm px-8 py-3 shrink-0">
            Subscribe
          </button>
        </form>

        <div className="h-5 flex items-center justify-center">
          {status === "success" && (
            <p className="text-green-500 text-xs font-semibold">
              ✓ Check your inbox for exciting updates!
            </p>
          )}
          {status === "error" && (
            <p className="text-rose-500 text-xs font-semibold">
              ✗ Please enter a valid email address
            </p>
          )}
          {status === "idle" && (
            <p className="text-slate-500 text-xs font-medium">No spam. Unsubscribe at any time.</p>
          )}
        </div>
      </div>
    </section>
  );
}
