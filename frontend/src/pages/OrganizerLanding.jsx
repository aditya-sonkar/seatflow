import { Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

export default function OrganizerLanding() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050505] dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex items-center min-h-[90vh] border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        {/* Background Image with optimized blend/opacity for better contrast */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540039155732-684735035726?auto=format&fit=crop&w=2000&q=80" 
            alt="Concert Crowd" 
            className="w-full h-full object-cover opacity-20 dark:opacity-30 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-slate-50/50 dark:from-[#050505] dark:via-[#050505]/90 dark:to-[#050505]/40 transition-colors duration-300"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 w-full text-center flex flex-col items-center justify-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase mb-6 leading-none transition-colors duration-300">
            <span className="text-slate-950 dark:text-white drop-shadow-sm">Sell Out.</span> <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent font-extrabold">Every Time.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 font-medium max-w-2xl leading-relaxed mb-10 transition-colors duration-300 mx-auto">
            The premier ticketing engine for creators who demand control. Maximize revenue, own your audience data, and build your legacy.
          </p>
          <div className="flex items-center justify-center">
            <Link
              to="/host-event"
              className="group inline-flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest dark:hover:bg-slate-200 transition-all hover:pr-6 duration-300 shadow-lg shadow-blue-500/10 dark:shadow-none"
            >
              Host Your Event
              <span className="w-8 h-8 rounded-full bg-slate-800 text-white dark:bg-black dark:text-white flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GENRE MARQUEE ── */}
      <div className="w-full bg-slate-100 dark:bg-[#050505] py-6 overflow-hidden flex items-center relative z-10 border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-sm md:text-base transition-colors duration-300">
              <span className="mx-6">Live Concerts</span>
              <span className="mx-6 text-slate-300 dark:text-white/20">•</span>
              <span className="mx-6">Club Nights</span>
              <span className="mx-6 text-slate-300 dark:text-white/20">•</span>
              <span className="mx-6">Festivals</span>
              <span className="mx-6 text-slate-300 dark:text-white/20">•</span>
              <span className="mx-6">Stand-up Comedy</span>
              <span className="mx-6 text-slate-300 dark:text-white/20">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <section className="bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white py-24 md:py-32 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 relative z-10">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center mb-32">
            {/* Feature 1: Image */}
            <div className="order-2 md:order-1 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80"
                alt="Frictionless Ticketing"
                className="w-full h-[500px] object-cover rounded-2xl border border-slate-200 dark:border-white/10 relative z-10 transition-transform duration-500 hover:scale-[1.01] shadow-2xl dark:shadow-black/50"
              />
            </div>
            {/* Feature 1: Text */}
            <div className="order-1 md:order-2 flex flex-col justify-center">
              <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3 transition-colors duration-300">01 // The Checkout</h3>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5 uppercase leading-none text-slate-900 dark:text-white transition-colors duration-300">
                Zero Drop-offs.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 transition-colors duration-300">
                Your marketing drives the traffic, our checkout ensures they buy. Built for extreme load and instant processing, giving your customers a flawless experience.
              </p>
              <div>
                <Link to="/host-event" className="inline-flex items-center gap-2 text-slate-800 hover:text-black dark:text-white font-bold uppercase tracking-widest text-sm border-b border-slate-300 dark:border-white/30 hover:border-slate-800 dark:hover:border-white transition-colors group">
                  See it in action <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            {/* Feature 2: Text */}
            <div className="order-1 flex flex-col justify-center md:pl-12">
              <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3 transition-colors duration-300">02 // The Data</h3>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5 uppercase leading-none text-slate-900 dark:text-white transition-colors duration-300">
                Own Your Crowd.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 transition-colors duration-300">
                Every ticket sold is an asset. We don't hide your customer data. Download your attendee lists, retarget them for your next show, and build an empire.
              </p>
              <div>
                <Link to="/host-event" className="inline-flex items-center gap-2 text-slate-800 hover:text-black dark:text-white font-bold uppercase tracking-widest text-sm border-b border-slate-300 dark:border-white/30 hover:border-slate-800 dark:hover:border-white transition-colors group">
                  Start Building <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
            {/* Feature 2: Image */}
            <div className="order-2 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80"
                alt="Data and Audience"
                className="w-full h-[500px] object-cover rounded-2xl border border-slate-200 dark:border-white/10 relative z-10 transition-transform duration-500 hover:scale-[1.01] shadow-2xl dark:shadow-black/50"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-slate-100 dark:bg-zinc-950 py-32 text-center px-6 border-t border-slate-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase mb-6 text-slate-900 dark:text-white leading-none transition-colors duration-300">
            The Stage Is Yours.
          </h2>
          <p className="text-xl md:text-2xl text-slate-650 dark:text-slate-400 font-medium mb-12 transition-colors duration-300">
            No upfront costs. Get started in less than 5 minutes.
          </p>
          <Link
            to="/host-event"
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black px-12 py-5 font-bold uppercase tracking-widest dark:hover:bg-slate-200 transition-all duration-300"
          >
            Create Your Event
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
