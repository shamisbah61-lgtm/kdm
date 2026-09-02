import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { totalItemsCount, wishlistCount } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'New Arrivals', path: '/products?sort=-created_at' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-500 bg-[#FBFBFD] ${scrolled ? 'border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]' : 'border-b border-transparent'}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        
        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden p-2 -ml-2 text-[#111111] hover:text-[#6B6B6B] transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>

        {/* LEFT: Brand Logo */}
        <Link to="/" className="flex items-center no-underline shrink-0 z-50 ml-4 lg:ml-8">
          <span className="text-[#111111] font-bold text-2xl tracking-tight uppercase">KDM</span>
        </Link>

        {/* CENTER: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path} 
              className={({ isActive }) => `text-[13px] font-medium tracking-wide transition-colors ${isActive ? 'text-[#111111]' : 'text-[#6B6B6B] hover:text-[#111111]'}`}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: Icons */}
        <div className="flex items-center gap-5 lg:gap-6 shrink-0 relative">
          
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="absolute right-full mr-4 flex items-center bg-white/95 backdrop-blur-xl rounded-full px-4 py-2 border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.08)] animate-fade-in w-[250px] z-50">
              <Search size={16} className="text-[#6B6B6B] mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search premium products..." 
                className="bg-transparent border-none outline-none w-full text-sm text-[#111111] placeholder:text-[#9CA3AF]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="text-[#6B6B6B] hover:text-[#111111] ml-2 shrink-0 transition-colors">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button className="text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 hidden sm:block" onClick={() => setIsSearchOpen(true)}>
              <Search size={20} strokeWidth={1.5} />
            </button>
          )}
          
          <Link to="/wishlist" className="text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 relative hidden sm:block">
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
          </Link>
          
          {isAuthenticated ? (
            <div className="group relative hidden sm:block">
              <Link to="/profile" className="text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 block">
                <User size={20} strokeWidth={1.5} />
              </Link>
              <div className="absolute right-0 top-full mt-4 w-56 bg-white border border-[#EAEAEA] shadow-[0_20px_40px_rgba(0,0,0,0.04)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 rounded-2xl">
                <div className="px-5 py-3 border-b border-[#EAEAEA] mb-2">
                  <p className="text-sm font-medium text-[#111111] truncate">{user?.email}</p>
                </div>
                {(user?.is_staff || user?.is_superuser) && (
                  <Link to="/admin-dashboard" className="block px-5 py-2 text-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F8F8F8] transition-colors">Admin Dashboard</Link>
                )}
                <Link to="/profile" className="block px-5 py-2 text-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F8F8F8] transition-colors">My Account</Link>
                <Link to="/orders" className="block px-5 py-2 text-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F8F8F8] transition-colors">Orders</Link>
                <button onClick={handleLogout} className="w-full text-left px-5 py-2 mt-2 text-sm text-[#111111] font-medium border-t border-[#EAEAEA] hover:bg-[#F8F8F8] transition-colors">Sign Out</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 hidden sm:block">
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <Link to="/cart" className="flex items-center gap-2 text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 relative group">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItemsCount > 0 ? (
              <span className="absolute -top-1 -right-2 bg-[#111111] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full group-hover:bg-[#333333] transition-colors">{totalItemsCount}</span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="px-6 py-6 border-b border-[#EAEAEA] flex justify-between items-center">
              <span className="text-[#111111] font-bold text-xl tracking-tight uppercase">KDM</span>
              <button onClick={() => setIsOpen(false)} className="p-1 text-[#6B6B6B] hover:text-[#111111]"><X size={24} strokeWidth={1.5} /></button>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => { handleSearchSubmit(e); setIsOpen(false); }} className="flex border border-[#EAEAEA] rounded-full overflow-hidden h-12 items-center bg-[#FBFBFD] focus-within:border-[#1D1D1F] focus-within:bg-white transition-colors mb-8 px-2">
                <input 
                  type="text" 
                  placeholder="Search premium products..." 
                  className="flex-1 h-full px-4 outline-none text-[15px] text-[#1D1D1F] bg-transparent" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="text-[#86868B] hover:text-[#1D1D1F] h-full px-3 flex items-center justify-center transition-colors"><Search size={16} /></button>
              </form>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink 
                    key={link.name} 
                    to={link.path} 
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `py-3 text-base flex items-center justify-between border-b border-[#EAEAEA] transition-colors ${isActive ? 'text-[#111111] font-medium' : 'text-[#6B6B6B]'}`}
                  >
                    {link.name} <ChevronRight size={16} strokeWidth={1.5} className="text-[#EAEAEA]" />
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-6 bg-[#FBFBFD] border-t border-[#EAEAEA] flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-[14px] font-medium text-[#1D1D1F]"><User size={18} strokeWidth={1.5} /> My Account</Link>
                  <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-[14px] font-medium text-[#1D1D1F]"><ShoppingBag size={18} strokeWidth={1.5} /> Orders</Link>
                  <Link to="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-[14px] font-medium text-[#1D1D1F]"><Heart size={18} strokeWidth={1.5} /> Wishlist ({wishlistCount})</Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-3 text-[14px] font-medium text-[#86868B] hover:text-[#FF3B30] mt-2 pt-4 border-t border-[#EAEAEA] transition-colors"><LogOut size={18} strokeWidth={1.5} /> Sign Out</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 bg-[#1D1D1F] text-white py-3.5 rounded-full text-[14px] font-semibold transition-transform active:scale-95">
                  <User size={16} /> Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
