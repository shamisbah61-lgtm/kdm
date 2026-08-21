import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Route protection wrapper. Redirects unauthenticated users to the Sign In page.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="loading-state container">Verifying authentication status...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function MainAppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');

  return (
    <div className="app-container">
      {!isAdminRoute && <Navbar />}
      
      <div className="content-wrapper">
        <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />

          {/* Customer Protected Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && (
        <footer className="bg-white border-t border-[#EAEAEA] py-16 mt-auto">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              
              <div className="flex flex-col gap-4">
                <h3 className="text-[#111111] font-medium text-sm tracking-widest uppercase mb-2">Shop</h3>
                <Link to="/products" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">All Products</Link>
                <Link to="/products?sort=-created_at" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">New Arrivals</Link>
                <Link to="/products?sort=sales" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Best Sellers</Link>
                <Link to="/collections" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Collections</Link>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-[#111111] font-medium text-sm tracking-widest uppercase mb-2">Customer Service</h3>
                <Link to="/contact" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Contact Us</Link>
                <Link to="/shipping" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Shipping Information</Link>
                <Link to="/returns" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Returns & Exchanges</Link>
                <Link to="/faq" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">FAQ</Link>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-[#111111] font-medium text-sm tracking-widest uppercase mb-2">Company</h3>
                <Link to="/about" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">About Maram</Link>
                <Link to="/privacy" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Privacy Policy</Link>
                <Link to="/terms" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Terms of Service</Link>
                <Link to="/careers" className="text-[#6B6B6B] hover:text-[#111111] transition-colors text-sm">Careers</Link>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-[#111111] font-medium text-sm tracking-widest uppercase mb-2">Newsletter</h3>
                <p className="text-[#6B6B6B] text-sm leading-relaxed mb-2">Get updates, new arrivals and exclusive offers directly to your inbox.</p>
                <form className="flex border border-[#EAEAEA] rounded-sm overflow-hidden h-12 focus-within:border-[#111111] transition-colors">
                  <input type="email" placeholder="Your email address" className="flex-1 px-4 text-sm text-[#111111] outline-none" required />
                  <button type="submit" className="bg-[#111111] text-white px-6 text-sm font-medium hover:bg-[#333333] transition-colors">Subscribe</button>
                </form>
              </div>
              
            </div>
            
            <div className="pt-8 border-t border-[#EAEAEA] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[#6B6B6B] text-sm">© {new Date().getFullYear()} Maram. All rights reserved.</p>
              <div className="flex gap-4">
                {/* Dummy Social/Payment Icons space */}
                <div className="w-8 h-5 bg-[#F8F8F8] border border-[#EAEAEA] rounded-sm"></div>
                <div className="w-8 h-5 bg-[#F8F8F8] border border-[#EAEAEA] rounded-sm"></div>
                <div className="w-8 h-5 bg-[#F8F8F8] border border-[#EAEAEA] rounded-sm"></div>
              </div>
            </div>
          </div>
        </footer>
      )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <MainAppLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
