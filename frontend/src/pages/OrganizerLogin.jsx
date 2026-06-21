import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OrganizerLogin() {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.state?.showSignUp || false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (isSignUp) {
      if (!formData.name) {
        setError("Name is required for sign up");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const result = await register(formData.name, formData.email, formData.password, "organizer");
      if (result.success) {
        navigate("/business/dashboard");
      } else {
        setError(result.message);
      }
    } else {
      const result = await login(formData.email, formData.password, "organizer");
      if (result.success) {
        navigate("/business/dashboard");
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Panel - Visual Identity */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-20 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1500&q=80"
            alt="Concert crowd"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex flex-col select-none font-black tracking-tighter text-white uppercase text-[32px] leading-[0.8] mb-2">
            <span>Seat</span>
            <span>Flow</span>
          </Link>
          <span className="text-primary font-bold tracking-widest uppercase text-xs">For Business</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Build your empire.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Join thousands of event organizers who trust SeatFlow to manage, market, and sell out their events effortlessly.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
          <span>Zero Listing Fees</span>
          <span>•</span>
          <span>Instant Payouts</span>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex flex-col select-none font-black tracking-tighter text-white uppercase text-[32px] leading-[0.8] mb-2">
              <span>Seat</span>
              <span>Flow</span>
            </Link>
            <div className="text-primary font-bold tracking-widest uppercase text-xs">For Business</div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">
              {isSignUp ? "Create Organizer Account" : "Organizer Log In"}
            </h2>
            <p className="text-zinc-400 text-sm font-medium">
              {isSignUp ? "Start selling tickets in minutes." : "Welcome back to your dashboard."}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="relative flex mb-8 bg-zinc-900 p-1 rounded-xl select-none border border-zinc-800">
            <div 
              className="absolute top-1 bottom-1 rounded-lg bg-zinc-800 transition-all duration-300 ease-out"
              style={{
                left: isSignUp ? "calc(50% - 2px)" : "4px",
                width: "calc(50% - 2px)"
              }}
            />
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`relative z-10 flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors duration-300 cursor-pointer ${
                !isSignUp ? "text-white" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`relative z-10 flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors duration-300 cursor-pointer ${
                isSignUp ? "text-white" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-sm font-semibold text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name Field */}
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: isSignUp ? "96px" : "0px",
                opacity: isSignUp ? 1 : 0,
                marginBottom: isSignUp ? "24px" : "0px"
              }}
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Company / Organizer Name
              </label>
              <input
                name="name"
                type="text"
                required={isSignUp}
                placeholder="e.g. Acme Events"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white placeholder-zinc-600 text-sm outline-none transition-all focus:border-white focus:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Business Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white placeholder-zinc-600 text-sm outline-none transition-all focus:border-white focus:bg-zinc-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <div 
                  className="transition-all duration-300 overflow-hidden"
                  style={{
                    maxHeight: !isSignUp ? "20px" : "0px",
                    opacity: !isSignUp ? 1 : 0
                  }}
                >
                  <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors font-semibold">
                    Forgot password?
                  </a>
                </div>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white placeholder-zinc-600 text-sm outline-none transition-all focus:border-white focus:bg-zinc-800"
              />
            </div>

            {/* Confirm Password Field */}
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: isSignUp ? "96px" : "0px",
                opacity: isSignUp ? 1 : 0,
                marginBottom: isSignUp ? "24px" : "0px"
              }}
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required={isSignUp}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white placeholder-zinc-600 text-sm outline-none transition-all focus:border-white focus:bg-zinc-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Log In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-zinc-550">
            {isSignUp ? "Already a partner? " : "New to SeatFlow? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white hover:underline cursor-pointer"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-zinc-900 text-center">
             <Link to="/login" className="text-xs text-zinc-500 font-bold uppercase tracking-wider hover:text-white transition-colors">
                Looking for regular user login? →
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
