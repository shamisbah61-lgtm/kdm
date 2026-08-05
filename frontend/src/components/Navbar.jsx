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
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo-text" style={{ fontSize: '24px' }}>
          KDM
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="btn btn-icon d-mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ border: 'none', background: 'none', color: 'var(--color-text-bright)' }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <button onClick={toggleTheme} className="nav-link theme-toggle-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}>
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
                <NavLink to="/admin-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                  <Landmark size={18} style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Admin</span>
                </NavLink>
              )}
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                <User size={18} />
                <span>Profile</span>
              </NavLink>
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary" onClick={() => setIsOpen(false)} style={{ padding: '8px 20px', color: '#000' }}>
              Sign In
            </NavLink>
          )}
        </div>
      </div>

      <style>{`
        .d-mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .d-mobile-only {
            display: block;
          }
          .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #120c0a;
            border-bottom: 1px solid var(--border-color);
            flex-direction: column;
            padding: 24px;
            gap: 20px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
          }
          .nav-links.active {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}
