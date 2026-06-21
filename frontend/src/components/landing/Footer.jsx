export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <div className="text-2xl font-black text-primary">SEAT</div>
              <div className="text-2xl font-black text-primary">FLOW</div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Discover and book unforgettable events near you.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary font-bold">
                f
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary font-bold">
                𝕏
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors text-primary font-bold">
                in
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase mb-4 tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Concerts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Comedy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Nightlife</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Festivals</a></li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase mb-4 tracking-wider">For Organizers</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Host Event</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Dashboard</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase mb-4 tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {currentYear} SeatFlow. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
