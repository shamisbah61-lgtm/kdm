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

    // Get click coordinates for the wave origin
    const x = e.clientX ?? window.innerWidth / 2;
    const y = e.clientY ?? window.innerHeight / 2;
    
    // Calculate distance to furthest corner
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
    <nav className="navbar relative z-50">
      <div className="container navbar-inner flex justify-between items-center h-full">
        <Link to="/" className="logo-text text-2xl font-bold no-underline text-[var(--color-primary)]">
          KDM
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="btn btn-icon md:hidden block border-none bg-transparent text-[var(--color-text-bright)] p-0" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:items-center absolute md:static top-full left-0 right-0 bg-[#120c0a] md:bg-transparent border-b border-[var(--border-color)] md:border-none p-6 md:p-0 gap-5 shadow-[0_10px_20px_rgba(0,0,0,0.5)] md:shadow-none`}>
          <button 
            onClick={toggleTheme} 
            className="nav-link theme-toggle-btn bg-transparent border-none cursor-pointer p-0 flex items-center text-[var(--color-text-bright)] hover:text-[var(--color-primary)]"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <Heart size={18} />
            <span>Wishlist</span>
            {wishlistCount > 0 && <span className="nav-link-badge">{wishlistCount}</span>}
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <ShoppingBag size={18} />
            <span>Cart</span>
            {totalItemsCount > 0 && <span className="nav-link-badge">{totalItemsCount}</span>}
          </NavLink>

          {isAuthenticated ? (
            <>
              {(user?.is_staff || user?.is_superuser) && (
                <NavLink to="/admin-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} text-[#fbbf24] font-bold hover:text-[#f59e0b]`} onClick={() => setIsOpen(false)}>
                  <Landmark size={18} className="text-[#fbbf24]" />
                  <span>Admin</span>
                </NavLink>
              )}
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <User size={18} />
                <span>Profile</span>
              </NavLink>
              <button onClick={handleLogout} className="nav-link bg-transparent border-none cursor-pointer flex items-center gap-2 text-[var(--color-text-bright)] hover:text-[var(--color-primary)]">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary px-5 py-2 text-black" onClick={() => setIsOpen(false)}>
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
