import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut, Menu, X, Landmark, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { totalItemsCount, wishlistCount } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (e) => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const x = e.clientX ?? window.innerWidth / 2;
    const y = e.clientY ?? window.innerHeight / 2;
    
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
    document.documentElement.style.setProperty('--r', `${endRadius}px`);

    document.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      setTheme(nextTheme);
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-card)]/80 backdrop-blur-2xl border-b border-[var(--border-color)] transition-all duration-300 py-4">
      <div className="container flex justify-between items-center h-full">
        <Link to="/" className="text-3xl font-extrabold font-[var(--font-heading)] tracking-tighter no-underline bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-transparent bg-clip-text hover:opacity-80 transition-opacity">
          KDM
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--color-text-bright)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Navigation Links */}
        <div className={`md:flex ${isOpen ? 'flex' : 'hidden'} flex-col md:flex-row md:items-center absolute md:static top-full left-0 right-0 bg-[var(--bg-card)] md:bg-transparent border-b border-[var(--border-color)] md:border-none p-6 md:p-0 gap-6 md:gap-8 shadow-2xl md:shadow-none`}>
          <button 
            onClick={toggleTheme} 
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="md:hidden font-medium">Toggle Theme</span>
          </button>
          
          <NavLink to="/" className={({ isActive }) => `text-[15px] font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)]'}`} onClick={() => setIsOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `text-[15px] font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)]'}`} onClick={() => setIsOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => `text-[15px] font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)]'}`} onClick={() => setIsOpen(false)}>
            <Heart size={20} />
            <span className="md:hidden">Wishlist</span>
            {wishlistCount > 0 && <span className="absolute -top-2.5 -right-3 md:-right-2 bg-[var(--color-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `text-[15px] font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)]'}`} onClick={() => setIsOpen(false)}>
            <ShoppingBag size={20} />
            <span className="md:hidden">Cart</span>
            {totalItemsCount > 0 && <span className="absolute -top-2.5 -right-3 md:-right-2 bg-[var(--color-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalItemsCount}</span>}
          </NavLink>

          {isAuthenticated ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-4 md:ml-4 md:pl-4 md:border-l border-[var(--border-color)]">
              {(user?.is_staff || user?.is_superuser) && (
                <NavLink to="/admin-dashboard" className={({ isActive }) => `text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 ${isActive ? 'text-amber-400 border-amber-400' : 'text-amber-500 hover:text-amber-400 hover:border-amber-400'}`} onClick={() => setIsOpen(false)}>
                  <Landmark size={16} />
                  <span>Admin</span>
                </NavLink>
              )}
              <NavLink to="/profile" className={({ isActive }) => `text-[15px] font-semibold flex items-center gap-2 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)]'}`} onClick={() => setIsOpen(false)}>
                <User size={20} />
                <span className="md:hidden">Profile</span>
              </NavLink>
              <button onClick={handleLogout} className="bg-transparent border-none cursor-pointer flex items-center gap-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-0">
                <LogOut size={20} />
                <span className="md:hidden font-semibold">Logout</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 md:mt-0 md:ml-4">
              <NavLink to="/login" className="btn btn-primary !py-2.5 !px-6" onClick={() => setIsOpen(false)}>
                Sign In
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
