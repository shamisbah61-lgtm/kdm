import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { totalItemsCount, wishlistCount } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

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
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'border-b border-[#EAEAEA] shadow-sm' : 'border-b border-transparent'}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        
        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden p-2 -ml-2 text-[#111111] hover:text-[#6B6B6B] transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>

        {/* LEFT: Brand Logo */}
        <Link to="/" className="flex items-center no-underline shrink-0 z-50">
          <span className="text-[#111111] font-bold text-2xl tracking-tight uppercase">Maram</span>
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
        <div className="flex items-center gap-5 lg:gap-6 shrink-0">
          <button className="text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 hidden sm:block">
            <Search size={20} strokeWidth={1.5} />
          </button>
          
          <Link to="/wishlist" className="text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 relative hidden sm:block">
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
          </Link>
          
          {isAuthenticated ? (
            <div className="group relative hidden sm:block">
              <Link to="/profile" className="text-[#111111] hover:text-[#6B6B6B] transition-colors p-1 block">
                <User size={20} strokeWidth={1.5} />
              </Link>
              <div className="absolute right-0 top-full mt-4 w-56 bg-white border border-[#EAEAEA] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 rounded-sm">
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
              <span className="text-[#111111] font-bold text-xl tracking-tight uppercase">Maram</span>
              <button onClick={() => setIsOpen(false)} className="p-1 text-[#6B6B6B] hover:text-[#111111]"><X size={24} strokeWidth={1.5} /></button>
            </div>
            
            <div className="p-6">
              <div className="flex border border-[#EAEAEA] rounded-sm overflow-hidden h-10 items-center bg-[#F8F8F8] focus-within:border-[#111111] transition-colors mb-8">
                <input type="text" placeholder="Search..." className="flex-1 h-full px-4 outline-none text-sm text-[#111111] bg-transparent" />
                <button className="text-[#6B6B6B] h-full px-3 flex items-center justify-center"><Search size={16} /></button>
              </div>

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

            <div className="mt-auto p-6 bg-[#F8F8F8] border-t border-[#EAEAEA] flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-sm font-medium text-[#111111]"><User size={18} strokeWidth={1.5} /> My Account</Link>
                  <Link to="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-sm font-medium text-[#111111]"><ShoppingBag size={18} strokeWidth={1.5} /> Orders</Link>
                  <Link to="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-sm font-medium text-[#111111]"><Heart size={18} strokeWidth={1.5} /> Wishlist ({wishlistCount})</Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-3 text-sm font-medium text-[#6B6B6B] mt-2 pt-4 border-t border-[#EAEAEA]"><LogOut size={18} strokeWidth={1.5} /> Sign Out</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 bg-[#111111] text-white py-3 rounded-sm text-sm font-medium">
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
