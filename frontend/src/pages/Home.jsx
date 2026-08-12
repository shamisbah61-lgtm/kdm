import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await apiRequest('/products/?featured=true&page_size=8');
        if (prodRes.success && prodRes.data.results) {
          setFeaturedProducts(prodRes.data.results);
        }
        const catRes = await apiRequest('/categories/');
        if (catRes.success) {
          setCategories(catRes.data.results || catRes.data || []);
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBuyNow = async (productId) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans overflow-hidden">
      
      {/* Absolute Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-12 pb-24">
        
        {/* HERO SECTION */}
        <div className="relative rounded-3xl overflow-hidden bg-[#111] h-[500px] md:h-[650px] flex items-center mb-24 border border-white/5 shadow-2xl group">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80" 
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-[2s]" 
              alt="Performance Auto Parts" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-10 md:p-20 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Zap size={14} className="fill-purple-500" /> Next-Gen Performance
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              ENGINEERED<br/>FOR EXCELLENCE
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed font-light">
              Discover our premium collection of high-performance automotive parts. Precision crafted to elevate your driving experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase text-sm tracking-widest hover:scale-105 hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Explore Collection
              </Link>
            </div>
          </div>
        </div>

        {/* PREMIUM CATEGORIES */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Explore Categories</h2>
              <p className="text-gray-400">Find exactly what you need for your build.</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 4).map((cat, idx) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="relative h-[220px] rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gray-900 z-0">
                  <img src={cat.image || `https://images.unsplash.com/photo-${1511919884226 + idx}?auto=format&fit=crop&q=80&w=400`} alt={cat.name} className="w-full h-full object-cover opacity-50 mix-blend-luminosity group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex justify-between items-end">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{cat.name}</h3>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-purple-500 transition-colors">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="mb-24">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12 text-center">Featured Masterpieces</h2>
          
          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <div key={product.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col h-full group hover:-translate-y-2 hover:bg-white/10 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  {product.discount_price && <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)]">Sale</span>}
                  
                  <Link to={`/products/${product.slug}`} className="relative h-48 mb-6 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400'} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10" />
                  </Link>
                  
                  <div className="flex flex-col flex-grow">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">{product.category_name}</div>
                    <Link to={`/products/${product.slug}`} className="text-base font-bold text-gray-200 line-clamp-2 mb-3 hover:text-white transition-colors">{product.name}</Link>
                    
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-purple-500 text-purple-500" />)}
                    </div>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        {product.discount_price ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 line-through">₹{product.price}</span>
                            <span className="font-black text-white text-xl">₹{product.discount_price}</span>
                          </div>
                        ) : (
                          <span className="font-black text-white text-xl">₹{product.price}</span>
                        )}
                      </div>
                      
                      <button 
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        onClick={() => handleBuyNow(product.id)}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TRUST SIGNALS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
              <ShieldCheck size={32} className="text-purple-400" />
            </div>
            <h4 className="text-lg font-bold mb-2">Authentic Parts</h4>
            <p className="text-sm text-gray-400">100% genuine components sourced directly from premium manufacturers.</p>
          </div>
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
              <Truck size={32} className="text-purple-400" />
            </div>
            <h4 className="text-lg font-bold mb-2">Express Delivery</h4>
            <p className="text-sm text-gray-400">Fast, insured shipping nationwide with real-time tracking.</p>
          </div>
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
              <Star size={32} className="text-purple-400" />
            </div>
            <h4 className="text-lg font-bold mb-2">Expert Support</h4>
            <p className="text-sm text-gray-400">Our automotive specialists are available 24/7 to assist your build.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
