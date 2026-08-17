import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Menu, Search, Phone, Mail, ChevronDown, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { totalItemsCount, wishlistCount } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={`w-full z-50 transition-all duration-300 ${scrolled ? 'sticky top-0 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'relative'} font-serif`}>
      {/* Top Header - Contact & Currency (Hidden on Mobile) */}
      <div className={`hidden lg:block bg-[#0f0e0d] transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden opacity-0 py-0' : 'h-auto py-2 border-b border-[#2a2622] opacity-100'} text-xs text-gray-400 font-sans`}>
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2 hover:text-[#d4af37] transition-colors cursor-pointer"><Phone size={14} className="text-[#d4af37]" /> Call Sommelier: (+91) 987 654 32 10</span>
            <span className="flex items-center gap-2 hover:text-[#d4af37] transition-colors cursor-pointer"><Mail size={14} className="text-[#d4af37]" /> Concierge: concierge@maramcraft.com</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#d4af37] transition-colors group">English <ChevronDown size={12} className="group-hover:rotate-180 transition-transform"/></span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#d4af37] transition-colors group">₹ INR <ChevronDown size={12} className="group-hover:rotate-180 transition-transform"/></span>
          </div>
        </div>
      </div>

      {/* Main Header - Logo, Search, Icons */}
      <div className="bg-[#111] border-b border-[#2a2622]">
        <div className={`max-w-[1400px] mx-auto px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 md:gap-8 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6 md:py-8'}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline shrink-0 group">
            <div className={`text-[#d4af37] font-black tracking-widest uppercase transition-all duration-300 ${scrolled ? 'text-2xl' : 'text-3xl lg:text-4xl'} group-hover:scale-105`}>
              MaramCraft
            </div>
          </Link>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-[#d4af37] hover:text-white hover:bg-[#221f1c] rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Search Bar (Hidden on very small screens, visible on md+) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 border border-[#3a352f] hover:border-[#d4af37]/50 focus-within:border-[#d4af37] focus-within:shadow-[0_0_15px_rgba(212,175,55,0.1)] rounded overflow-hidden h-12 items-center bg-[#1a1816] transition-all duration-300 font-sans">
            <div className="px-5 text-sm font-bold text-[#d4af37] border-r border-[#3a352f] h-full flex items-center bg-[#0f0e0d] shrink-0 cursor-pointer hover:text-white hover:bg-[#221f1c] transition-colors">
              Cellars <ChevronDown size={16} className="ml-2"/>
            </div>
            <input type="text" placeholder="Search for fine spirits, wines, whiskies..." className="flex-1 h-full px-5 outline-none text-base text-gray-200 bg-[#1a1816] placeholder-gray-600 font-medium" />
            <button className="bg-[#d4af37] hover:bg-white text-black h-full px-8 flex items-center justify-center transition-colors shadow-inner">
              <Search size={20} /> <span className="ml-2 font-bold text-base tracking-wider uppercase text-xs">Discover</span>
            </button>
          </div>

          {/* Icons (Wishlist, Account, Cart) */}
          <div className="flex items-center gap-4 md:gap-6 shrink-0 font-sans">
            <Link to="/wishlist" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1816] border border-[#3a352f] text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37] hover:bg-[#0f0e0d] relative transition-all duration-300 group">
              <Heart size={20} className="group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-[#d4af37] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-pulse">{wishlistCount}</span>}
            </Link>
            
            {isAuthenticated ? (
              <div className="group relative">
                <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1816] border border-[#3a352f] text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37] hover:bg-[#0f0e0d] transition-all duration-300">
                  <User size={20} className="group-hover:scale-110 transition-transform" />
                </Link>
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-[#3a352f] rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#2a2622] bg-[#0f0e0d]">
                    <p className="text-xs text-[#d4af37] uppercase tracking-wider font-bold mb-1">Welcome back</p>
                    <p className="text-sm text-white font-medium truncate">{user?.email || 'Connoisseur'}</p>
                  </div>
                  <div className="py-2">
                    {(user?.is_staff || user?.is_superuser) && (
                      <Link to="/admin-dashboard" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1816] hover:text-[#d4af37] hover:pl-6 transition-all">Cellar Master Panel</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1816] hover:text-[#d4af37] hover:pl-6 transition-all">My Cabinet (Profile)</Link>
                    <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1816] hover:text-[#d4af37] hover:pl-6 transition-all">Order History</Link>
                  </div>
                  <div className="border-t border-[#2a2622] py-2">
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-[#ff4444] hover:bg-[#1a1816] hover:pl-6 transition-all font-bold tracking-wider">Sign Out</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1816] border border-[#3a352f] text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37] hover:bg-[#0f0e0d] transition-all duration-300 group">
                <User size={20} className="group-hover:scale-110 transition-transform" />
              </Link>
            )}

            <Link to="/cart" className="flex items-center gap-3 bg-transparent border border-[#d4af37] hover:bg-[#d4af37] text-[#d4af37] hover:text-black px-5 py-2.5 rounded transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 group">
              <div className="relative">
                <ShoppingCart size={20} className="group-hover:-rotate-12 transition-transform" />
                {totalItemsCount > 0 && <span className="absolute -top-2.5 -right-2.5 bg-white text-black text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-md animate-bounce">{totalItemsCount}</span>}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[9px] uppercase font-bold tracking-widest leading-none mb-0.5 opacity-80">My Cart</div>
                <div className="text-sm font-black leading-none font-serif">{totalItemsCount} Items</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Menu (Black Background) */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'} bg-[#0f0e0d] border-b border-[#2a2622] w-full relative z-40 shadow-xl lg:shadow-none transition-all duration-300`}>
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center">
          
          {/* Mobile Search (Visible only on small screens) */}
          <div className="md:hidden p-4 bg-[#111] border-b border-[#2a2622] font-sans">
            <div className="flex border border-[#3a352f] rounded overflow-hidden h-12 items-center bg-[#1a1816] focus-within:border-[#d4af37] transition-colors">
              <input type="text" placeholder="Search for fine spirits..." className="flex-1 h-full px-4 outline-none text-sm text-gray-200 bg-transparent" />
              <button className="bg-[#d4af37] text-black h-full px-5 flex items-center justify-center">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-[#d4af37] hover:bg-white transition-colors cursor-pointer text-black px-6 py-4 font-bold uppercase tracking-widest text-xs w-[280px] shrink-0 group">
            <Menu size={18} className="group-hover:scale-110 transition-transform" /> Spirit Categories
          </div>

          <nav className="flex flex-col lg:flex-row lg:items-center lg:gap-8 px-4 lg:px-8 py-4 lg:py-0 w-full font-sans">
            <NavLink to="/" className={({ isActive }) => `block py-3 lg:py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-b border-[#2a2622] lg:border-none last:border-none ${isActive ? 'text-[#d4af37] lg:border-b-2 lg:border-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37] hover:pl-2 lg:hover:pl-0'}`}>
              Cellar Front
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `block py-3 lg:py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-b border-[#2a2622] lg:border-none last:border-none ${isActive ? 'text-[#d4af37] lg:border-b-2 lg:border-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37] hover:pl-2 lg:hover:pl-0'}`}>
              Shop Spirits
            </NavLink>
            <NavLink to="/products?sort=-created_at" className={({ isActive }) => `block py-3 lg:py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-b border-[#2a2622] lg:border-none last:border-none flex items-center gap-2 ${isActive ? 'text-[#d4af37] lg:border-b-2 lg:border-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37] hover:pl-2 lg:hover:pl-0'}`}>
              New Arrivals <span className="bg-[#d4af37] text-black text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest">New</span>
            </NavLink>
            <NavLink to="/products?sort=price" className={({ isActive }) => `block py-3 lg:py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-b border-[#2a2622] lg:border-none last:border-none ${isActive ? 'text-[#d4af37] lg:border-b-2 lg:border-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37] hover:pl-2 lg:hover:pl-0'}`}>
              Collector's Offers
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `block py-3 lg:py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-b border-[#2a2622] lg:border-none last:border-none ${isActive ? 'text-[#d4af37] lg:border-b-2 lg:border-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37] hover:pl-2 lg:hover:pl-0'}`}>
              Contact Us
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
