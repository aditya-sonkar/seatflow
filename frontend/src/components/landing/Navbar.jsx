import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const isBusinessRoute = location.pathname.startsWith("/business") || location.pathname.startsWith("/host-event");

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="inline-flex flex-col select-none font-black tracking-tighter text-slate-900 dark:text-white uppercase text-xl leading-[0.8] hover:opacity-80 transition-opacity">
          <span>Seat</span>
          <span className="text-primary">Flow</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`relative py-1 font-semibold text-sm transition-colors group ${
              isActive("/") ? "text-blue-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            Home
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-blue-600 dark:bg-blue-500 transition-all duration-300 w-0 group-hover:w-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
          </Link>
          <Link
            to="/events"
            className={`relative py-1 font-semibold text-sm transition-colors group ${
              isActive("/events") ? "text-blue-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            Events
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-blue-600 dark:bg-blue-500 transition-all duration-300 w-0 group-hover:w-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
          </Link>
          <Link
            to="/business"
            className={`relative py-1 text-sm font-semibold transition-colors duration-200 group ${
              isActive("/business") || isActive("/host-event")
                ? "text-primary dark:text-primary-light"
                : "text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary-light"
            }`}
          >
            Host Event
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-primary dark:bg-blue-500 transition-all duration-300 w-0 group-hover:w-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Profile / Login */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="font-semibold text-sm transition-colors text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer px-2"
              >
                Login
              </button>
            )}

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden py-2">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role !== "organizer" && (
                      <Link
                        to="/bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                      >
                        My Bookings
                      </Link>
                    )}
                    {user.role === "organizer" && (
                      <Link
                        to="/business/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                      >
                        Organizer Dashboard
                      </Link>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-700"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col">
                    {/* For Users */}
                    <div className="px-4 py-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">For Users</p>
                      <Link to="/login" onClick={() => setDropdownOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                        Login
                      </Link>
                      <Link to="/login" state={{ showSignUp: true }} onClick={() => setDropdownOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                        Signup
                      </Link>
                    </div>
                    
                    <div className="border-t border-slate-100 dark:border-slate-700/50 my-1"></div>

                    {/* For Event Organisers */}
                    <div className="px-4 py-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">For Event Organisers</p>
                      <Link to="/business/login" onClick={() => setDropdownOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                        Login
                      </Link>
                      <Link to="/business/login" state={{ showSignUp: true }} onClick={() => setDropdownOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                        Signup
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700/50 my-1"></div>

                    {/* For Promoters */}
                    <div className="px-4 py-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">For Promoters</p>
                      <Link to="/business/login" onClick={() => setDropdownOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                        Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black absolute w-full">
          <nav className="flex flex-col p-4 gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                isActive("/") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                isActive("/events") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Events
            </Link>
            <Link
              to="/business"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                isActive("/business") || isActive("/host-event") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Host Event
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
