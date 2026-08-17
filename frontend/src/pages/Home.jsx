import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Zap, Gauge, Wrench, ChevronRight, Menu, ArrowRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [deals, setDeals] = useState([]);
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
        const dealsRes = await apiRequest('/products/?page_size=8&ordering=price');
        if (dealsRes.success && dealsRes.data.results) {
          setDeals(dealsRes.data.results);
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
    <div className="bg-[#050505] min-h-screen text-gray-200 font-sans selection:bg-[#ff3333] selection:text-white">
      {/* Dynamic Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[600px] flex items-center justify-center overflow-hidden border-b border-[#222]">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1610444558231-1e309ccf3b33?auto=format&fit=crop&q=80" alt="KDM Tuning Car" className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#ff3333]/10 border border-[#ff3333]/30 px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#ff3333] animate-ping"></span>
              <span className="text-[#ff3333] text-[10px] font-black uppercase tracking-[0.2em]">KDM Performance Parts</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl">
              Unleash <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3333] to-[#880000]">Power</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base lg:text-lg mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed border-l-2 border-[#ff3333] pl-4">
              Premium tuning components for Hyundai, Kia, and Genesis. Upgrade your ride with track-tested aerodynamics, exhaust systems, and forged internals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/products" className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white uppercase tracking-wider bg-[#ff3333] overflow-hidden rounded-md shadow-[0_0_20px_rgba(255,51,51,0.3)] hover:shadow-[0_0_30px_rgba(255,51,51,0.6)] transition-all duration-300">
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                <span className="relative flex items-center gap-2">Explore Catalog <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link to="/categories" className="group inline-flex items-center justify-center px-8 py-4 font-bold text-gray-300 uppercase tracking-wider bg-transparent border border-[#333] hover:border-[#ff3333] hover:text-[#ff3333] rounded-md transition-all duration-300">
                View Brands
              </Link>
            </div>
          </div>
          
          {/* Animated decorative graphic on right */}
          <div className="hidden lg:block relative w-[400px] h-[400px]">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#333] rounded-full animate-[spin_10s_linear_infinite]"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-dashed border-[#ff3333]/30 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
             <img src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80" alt="Turbo" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 object-cover rounded-full mix-blend-screen shadow-[0_0_50px_rgba(255,51,51,0.4)] opacity-80" />
          </div>
        </div>
      </section>

      {/* Trust & Features */}
      <section className="bg-[#0a0a0a] border-b border-[#222]">
        <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Gauge, title: "Dyno Tested", desc: "Proven performance gains" },
            { icon: ShieldCheck, title: "KDM Certified", desc: "Genuine fitment" },
            { icon: Zap, title: "Fast Shipping", desc: "Express delivery worldwide" },
            { icon: Wrench, title: "Pro Support", desc: "Expert tuning advice" }
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[#ff3333] mb-4 group-hover:scale-110 group-hover:bg-[#ff3333] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,51,51,0.4)] transition-all duration-300">
                <feature.icon size={24} />
              </div>
              <h3 className="text-white font-black uppercase tracking-wider text-sm mb-1">{feature.title}</h3>
              <p className="text-gray-500 text-xs font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col lg:flex-row gap-10">
        
        {/* Categories Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-28">
            <h3 className="text-white font-black text-xl uppercase tracking-widest mb-6 flex items-center gap-2">
              <Menu size={24} className="text-[#ff3333]" /> Categories
            </h3>
            <ul className="flex flex-col gap-2">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.slug}`} className="group flex items-center justify-between p-4 bg-[#111] rounded-lg border border-[#222] hover:border-[#ff3333] hover:shadow-[0_0_20px_rgba(255,51,51,0.1)] transition-all duration-300">
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">{cat.name}</span>
                    <ChevronRight size={16} className="text-[#ff3333] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Special Ad */}
            <div className="mt-8 relative rounded-xl overflow-hidden group cursor-pointer border border-[#222] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <img src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=300" className="w-full h-64 object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="Brakes" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="bg-[#ff3333] text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest mb-2 inline-block shadow-md">Up to 20% Off</span>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-3">Big Brake<br/>Kits</h4>
                <span className="text-xs font-bold text-[#ff3333] flex items-center gap-1 group-hover:text-white transition-colors">Shop Now <ArrowRight size={12} /></span>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end justify-between mb-8 border-b border-[#222] pb-4">
            <div>
              <span className="text-[#ff3333] text-xs font-black uppercase tracking-[0.2em]">Top Tier</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mt-1">Featured Parts</h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#ff3333] uppercase tracking-wider transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-[#222] border-t-[#ff3333] rounded-full animate-spin shadow-[0_0_15px_rgba(255,51,51,0.5)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <div key={product.id} className="bg-[#0a0a0a] rounded-xl border border-[#222] p-5 group hover:border-[#ff3333]/50 hover:shadow-[0_0_30px_rgba(255,51,51,0.1)] transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                  
                  {/* Hover Light Effect */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ff3333] blur-[80px] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none"></div>

                  <Link to={`/products/${product.slug}`} className="block h-48 flex items-center justify-center mb-6 p-4 relative z-10 bg-[#111] rounded-lg border border-[#1a1a1a]">
                    <img src={product.thumbnail || 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?w=300&q=80'} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-2xl mix-blend-screen" />
                    {product.discount_price && (
                      <span className="absolute top-2 left-2 bg-[#ff3333] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-lg">Sale</span>
                    )}
                  </Link>
                  
                  <div className="flex flex-col flex-grow relative z-10">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className={`fill-current ${i < 4 ? 'text-yellow-500' : 'text-gray-700'}`} />)}
                    </div>
                    
                    <Link to={`/products/${product.slug}`} className="text-sm font-bold text-gray-300 line-clamp-2 mb-4 group-hover:text-white min-h-[40px] leading-relaxed transition-colors">
                      {product.name}
                    </Link>
                    
                    <div className="flex items-center gap-3 mb-6 mt-auto">
                      {product.discount_price ? (
                        <>
                          <span className="font-black text-[#ff3333] text-xl">₹{product.discount_price}</span>
                          <span className="text-xs text-gray-600 line-through font-bold">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="font-black text-white text-xl">₹{product.price}</span>
                      )}
                    </div>
                    
                    <button 
                      className="w-full bg-[#111] hover:bg-[#ff3333] text-white border border-[#333] hover:border-[#ff3333] py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md"
                      onClick={() => handleBuyNow(product.id)}
                    >
                      <ShoppingCart size={16} className="group-hover/btn:-rotate-12 transition-transform" /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lower Promo Section */}
      <section className="border-t border-[#222] bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-[#111] to-[#050505] rounded-2xl border border-[#333] overflow-hidden relative flex flex-col md:flex-row items-center justify-between min-h-[300px] shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')]"></div>
            
            <div className="relative z-10 p-10 md:p-16 max-w-xl">
              <div className="inline-block bg-[#222] text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded mb-4">Stage 2 Upgrades</div>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Complete <span className="text-[#ff3333]">Performance</span> Packages</h2>
              <p className="text-gray-400 mb-8 font-medium leading-relaxed">Save up to 15% when you bundle intake, exhaust, and tuning modules together. Expertly matched for optimal power gains and reliability.</p>
              <Link to="/products" className="bg-white text-black px-8 py-4 rounded-md font-black uppercase tracking-widest text-xs hover:bg-[#ff3333] hover:text-white transition-colors duration-300 shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_30px_rgba(255,51,51,0.4)] inline-block">
                View Bundles
              </Link>
            </div>
            
            <div className="relative z-10 p-10 md:p-0 md:pr-16 w-full md:w-auto flex justify-center">
               <div className="w-64 h-64 bg-[#ff3333]/20 rounded-full blur-[80px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
               <img src="https://images.unsplash.com/photo-1600705722908-bab1e6191b1a?auto=format&fit=crop&w=400" className="relative z-10 drop-shadow-[0_20px_50px_rgba(255,51,51,0.2)] mix-blend-screen scale-110 object-contain hover:scale-125 transition-transform duration-700" alt="Engine Parts" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
