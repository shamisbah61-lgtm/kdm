import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, Zap } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
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
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* MASSIVE TYPOGRAPHY HERO SECTION */}
      <div className="relative z-10 w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Zap size={14} className="text-purple-500" /> Premium Automotive Accessories
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black leading-none tracking-tighter mb-8 max-w-5xl">
          <span className="block text-white opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>REDEFINE</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-red-500 to-amber-500 opacity-0 animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>YOUR RIDE.</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-2xl max-w-2xl font-light opacity-0 animate-fade-in-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
          Discover the absolute pinnacle of automotive performance parts.
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
          <div className="w-[1px] h-16 bg-gradient-to-b from-purple-500 to-transparent"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-24 pt-10">

        {/* FEATURED PRODUCTS */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold tracking-widest uppercase mb-10 text-white/50 border-b border-white/10 pb-4">Latest Arrivals</h2>
          
          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <div key={product.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col h-full group hover:-translate-y-2 hover:bg-white/10 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  {product.discount_price && <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)]">Sale</span>}
                  
                  <Link to={`/products/${product.slug}`} className="relative h-56 mb-6 flex items-center justify-center p-4">
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
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">Authentic Parts</h4>
            <p className="text-sm text-gray-400">100% genuine components sourced directly from premium manufacturers.</p>
          </div>
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Truck size={32} className="text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">Express Delivery</h4>
            <p className="text-sm text-gray-400">Fast, insured shipping nationwide with real-time tracking.</p>
          </div>
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Star size={32} className="text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">Expert Support</h4>
            <p className="text-sm text-gray-400">Our automotive specialists are available 24/7 to assist your build.</p>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slide-up {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
