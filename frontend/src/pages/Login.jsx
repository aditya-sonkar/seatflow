import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

export default function Login() {
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

      const result = await register(formData.name, formData.email, formData.password, "user");
      if (result.success) {
        navigate("/events");
      } else {
        setError(result.message);
      }
    } else {
      const result = await login(formData.email, formData.password, "user");
      if (result.success) {
        navigate("/events");
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-[#f8fafc] transition-colors duration-200">
      <Navbar />

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-20">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col select-none font-black tracking-tighter text-primary uppercase text-[32px] leading-[0.8]">
              <span>Seat</span>
              <span>Flow</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">{isSignUp ? "Create your account" : "Welcome back"}</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            {/* Tab Toggle */}
            <div className="relative flex mb-6 bg-slate-100 dark:bg-white/5 p-1 rounded-lg select-none">
              <div 
                className="absolute top-1 bottom-1 rounded-md bg-white shadow-sm dark:bg-white/10 transition-all duration-300 ease-out"
                style={{
                  left: isSignUp ? "calc(50% - 2px)" : "4px",
                  width: "calc(50% - 2px)"
                }}
              />
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`relative z-10 flex-1 py-2 rounded-md font-semibold text-sm transition-colors duration-300 cursor-pointer ${
                  !isSignUp ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`relative z-10 flex-1 py-2 rounded-md font-semibold text-sm transition-colors duration-300 cursor-pointer ${
                  isSignUp ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3.5 mb-6 text-sm text-red-600 dark:text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              <div 
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  maxHeight: isSignUp ? "90px" : "0px",
                  opacity: isSignUp ? 1 : 0,
                  marginBottom: isSignUp ? "16px" : "0px"
                }}
              >
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none transition-all focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-white/8"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none transition-all focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-white/8"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none transition-all focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-white/8"
                />
              </div>

              {/* Confirm Password (Sign Up Only) */}
              <div 
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  maxHeight: isSignUp ? "90px" : "0px",
                  opacity: isSignUp ? 1 : 0,
                  marginBottom: isSignUp ? "16px" : "0px"
                }}
              >
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none transition-all focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-white/8"
                />
              </div>

              {/* Forgot Password Link (Sign In Only) */}
              <div 
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  maxHeight: !isSignUp ? "30px" : "0px",
                  opacity: !isSignUp ? 1 : 0,
                  marginBottom: !isSignUp ? "8px" : "0px"
                }}
              >
                <div className="text-right">
                  <a href="#" className="text-xs text-slate-500 hover:text-primary transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
              >
                {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2.5 bg-white dark:bg-[#121825] text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button className="h-10 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-white/2 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-700 dark:text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
              <button className="h-10 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-white/2 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-700 dark:text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sign In/Up Toggle */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
