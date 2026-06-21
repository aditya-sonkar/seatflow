import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  {
    category: "CONCERTS",
    title: "Coldplay Live in Concert",
    desc: "Experience the magic of Music of the Spheres. Get your tickets now for the biggest concert of the year.",
    bg: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=90"
  },
  {
    category: "COMEDY",
    title: "Vir Das Global Tour",
    desc: "World-class comedy from an international sensation. Laugh your heart out with one of the best.",
    bg: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1920&q=90"
  },
  {
    category: "FESTIVALS",
    title: "Summer Music Festival",
    desc: "Three days of non-stop music, art, and entertainment. Join thousands of festival lovers.",
    bg: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=90"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const autoSlideTimer = useRef(null);

  useEffect(() => {
    autoSlideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(autoSlideTimer.current);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    clearInterval(autoSlideTimer.current);
    autoSlideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    clearInterval(autoSlideTimer.current);
    autoSlideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
  };

  return (
    <div className="relative w-full min-h-[90vh] bg-black flex flex-col justify-center">
      {/* Slides */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url('${slide.bg}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Clean dark overlay */}
            <div className="absolute inset-0 bg-black/70" />
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-3xl text-white animate-fade-in-up">
          <span className="inline-block text-xs font-bold tracking-widest text-blue-400 mb-4 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
            {SLIDES[currentSlide].category}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            {SLIDES[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
            {SLIDES[currentSlide].desc}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/events")}
              className="btn-primary"
            >
              Book Tickets
            </button>
            <button
              className="px-6 py-3 rounded-lg border border-slate-600 hover:border-slate-400 hover:bg-slate-800/50 transition-all font-semibold text-white"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-slate-500 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Search Widget - Clean and flat */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-6 -mb-16">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const q = formData.get("q");
            const category = formData.get("category");
            const city = formData.get("city");
            
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (category !== "All Categories") params.set("category", category);
            if (city !== "All Cities") params.set("city", city);
            
            navigate(`/events?${params.toString()}`);
          }}
          className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg border border-slate-200 dark:border-neutral-800 p-6 md:p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Search Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Event Name</label>
              <input
                name="q"
                type="text"
                placeholder="Search events, artists..."
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
              <select name="category" className="form-input w-full">
                <option>All Categories</option>
                <option value="Concerts">Concerts</option>
                <option value="Comedy">Comedy</option>
                <option value="Theatre">Theatre</option>
                <option value="Sports">Sports</option>
                <option value="Nightlife">Nightlife</option>
                <option value="Festival">Festival</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">City</label>
              <select name="city" className="form-input w-full">
                <option>All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
                <option value="Ahmedabad">Ahmedabad</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5">Search</button>
          </div>
        </form>
      </div>
    </div>
  );
}
