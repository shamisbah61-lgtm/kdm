import { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Menu, Search, Phone, Mail, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { totalItemsCount, wishlistCount } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#0a0a0a] w-full border-b border-[#222]">
      {/* Top Header - Contact & Currency (Hidden on Mobile) */}
      <div className="hidden lg:block bg-[#111] border-b border-[#222] py-2 text-xs text-gray-400">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Phone size={14} className="text-[#ff3333]" /> Call us: (+00) 012 345 67 89</span>
            <span className="flex items-center gap-2"><Mail size={14} className="text-[#ff3333]" /> Email us: demo@gmail.com</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-white">English <ChevronDown size={12}/></span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-white">$ Currency <ChevronDown size={12}/></span>
          </div>
        </div>
      </div>

      {/* Main Header - Logo, Search, Icons */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:py-8 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 md:gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
          <img src={logo} alt="KDM Logo" className="h-16 md:h-20 lg:h-24 object-contain" />
        </Link>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Search Bar (Hidden on very small screens, visible on md+) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 border border-[#333] rounded overflow-hidden h-12 items-center bg-[#111]">
          <div className="px-5 text-sm font-bold text-gray-400 border-r border-[#333] h-full flex items-center bg-[#1a1a1a] shrink-0 cursor-pointer hover:text-white transition-colors">
            All Categories <ChevronDown size={16} className="ml-2"/>
          </div>
          <input type="text" placeholder="Search..." className="flex-1 h-full px-5 outline-none text-base text-gray-200 bg-[#111] placeholder-gray-500" />
          <button className="bg-[#ff3333] hover:bg-[#e60000] text-white h-full px-8 flex items-center justify-center transition-colors">
            <Search size={20} /> <span className="ml-2 font-bold text-base">Search</span>
          </button>
        </div>

        {/* Icons (Wishlist, Account, Cart) */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <Link to="/wishlist" className="flex items-center gap-2 text-gray-300 hover:text-white relative transition-colors">
            <Heart size={22} />
            {wishlistCount > 0 && <span className="absolute -top-1.5 -right-2 bg-[#ff3333] text-white text-[10px] font-bold px-1.5 py-0 rounded-full">{wishlistCount}</span>}
          </Link>
          
          {isAuthenticated ? (
            <div className="group relative">
              <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <User size={22} />
              </Link>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-[#333] rounded shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {(user?.is_staff || user?.is_superuser) && (
                  <Link to="/admin-dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#222] hover:text-white">Admin Panel</Link>
                )}
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#222] hover:text-white">My Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-[#ff3333] hover:bg-[#222]">Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <User size={22} />
            </Link>
          )}

          <Link to="/cart" className="flex items-center gap-3 bg-[#ff3333] hover:bg-[#e60000] text-white px-4 py-2 rounded transition-colors">
            <div className="relative">
              <ShoppingCart size={20} />
              {totalItemsCount > 0 && <span className="absolute -top-2 -right-2 bg-white text-[#ff3333] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{totalItemsCount}</span>}
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase font-medium leading-tight">Checkout</div>
              <div className="text-sm font-bold leading-tight">{totalItemsCount} Items</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Menu (Black Background) */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'} bg-[#111] border-t border-[#222] w-full`}>
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center">
          
          {/* Mobile Search (Visible only on small screens) */}
          <div className="md:hidden p-4 bg-[#0a0a0a] border-b border-[#222]">
            <div className="flex border border-[#333] rounded overflow-hidden h-10 items-center bg-[#111]">
              <input type="text" placeholder="Search..." className="flex-1 h-full px-4 outline-none text-sm text-gray-200 bg-transparent" />
              <button className="bg-[#ff3333] text-white h-full px-4 flex items-center justify-center">
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-[#222] text-white px-6 py-3.5 font-bold uppercase text-sm w-[280px] shrink-0 border-r border-[#333]">
            <Menu size={18} /> Shop Categories
          </div>

          <nav className="flex flex-col lg:flex-row lg:items-center lg:gap-8 px-4 lg:px-8 py-2 lg:py-0 w-full">
            <NavLink to="/" className={({ isActive }) => `block py-2 lg:py-3.5 text-sm font-bold uppercase transition-colors ${isActive ? 'text-[#ff3333]' : 'text-gray-300 hover:text-[#ff3333]'}`}>
              Home
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `block py-2 lg:py-3.5 text-sm font-bold uppercase transition-colors ${isActive ? 'text-[#ff3333]' : 'text-gray-300 hover:text-[#ff3333]'}`}>
              Shop Auto Parts
            </NavLink>
            <NavLink to="/products?sort=-created_at" className={({ isActive }) => `block py-2 lg:py-3.5 text-sm font-bold uppercase transition-colors ${isActive ? 'text-[#ff3333]' : 'text-gray-300 hover:text-[#ff3333]'}`}>
              New Arrivals
            </NavLink>
            <NavLink to="/products?sort=price" className={({ isActive }) => `block py-2 lg:py-3.5 text-sm font-bold uppercase transition-colors ${isActive ? 'text-[#ff3333]' : 'text-gray-300 hover:text-[#ff3333]'}`}>
              Best Deals
            </NavLink>
            <NavLink to="/wishlist" className={({ isActive }) => `block py-2 lg:py-3.5 text-sm font-bold uppercase transition-colors ${isActive ? 'text-[#ff3333]' : 'text-gray-300 hover:text-[#ff3333]'}`}>
              My Wishlist
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
