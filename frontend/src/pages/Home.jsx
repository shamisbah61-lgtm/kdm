import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, PhoneCall, ArrowRight, ChevronRight, Menu, Wine, GlassWater, Martini } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
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
    <div className="bg-[#0f0e0d] min-h-screen pt-4 md:pt-8 pb-12 overflow-hidden text-gray-200 font-serif">
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-[#1a1816] rounded-xl border border-[#2a2622] shadow-[0_8px_30px_rgb(0,0,0,0.5)] mb-8 overflow-hidden transition-all duration-300">
            <div className="bg-gradient-to-r from-[#111] to-[#1a1816] text-[#d4af37] p-4.5 flex items-center gap-3 font-bold uppercase tracking-widest text-sm border-b border-[#2a2622]">
              <Menu size={18} className="text-[#d4af37]" /> Spirit Categories
            </div>
            <ul className="flex flex-col py-2">
              {categories.slice(0, 10).map((cat, idx) => (
                <li key={cat.id} className="border-b border-[#2a2622] last:border-0">
                  <Link to={`/products?category=${cat.slug}`} className="group flex items-center justify-between px-5 py-3.5 text-gray-400 hover:text-[#d4af37] hover:bg-[#221f1c] transition-all duration-300 text-sm font-medium relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#d4af37] transition-colors duration-300"></div>
                      {cat.name}
                    </span>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-[#d4af37] transform group-hover:translate-x-1 transition-all duration-300 relative z-10" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Promo Side Banner */}
          <div className="bg-gradient-to-b from-[#8b5a2b] to-[#4a2e15] text-white p-8 text-center rounded-xl shadow-[0_10px_40px_rgba(139,90,43,0.3)] mb-8 relative overflow-hidden group border border-[#a67c52]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-3">
                <GlassWater size={28} className="text-[#f5deb3] drop-shadow-md" />
              </div>
              <h4 className="font-bold text-xs mb-2 uppercase tracking-widest text-[#f5deb3]">Collector's Edition</h4>
              <h3 className="font-bold text-3xl uppercase mb-4 drop-shadow-md tracking-tight font-serif text-white">Rare<br/>Reserve</h3>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 mb-5 border border-white/10">
                <p className="text-xs font-medium mb-3 text-[#f5deb3] uppercase tracking-wide">Limited Allocation:</p>
                <div className="flex justify-center gap-2">
                  <div className="bg-[#1a1816] text-[#d4af37] p-2 rounded w-12 border border-[#3a352f]"><div className="font-bold text-lg leading-none">03</div><div className="text-[9px] uppercase font-bold text-gray-500 mt-1">Days</div></div>
                  <div className="bg-[#1a1816] text-[#d4af37] p-2 rounded w-12 border border-[#3a352f]"><div className="font-bold text-lg leading-none">12</div><div className="text-[9px] uppercase font-bold text-gray-500 mt-1">Hrs</div></div>
                  <div className="bg-[#1a1816] text-[#d4af37] p-2 rounded w-12 border border-[#3a352f]"><div className="font-bold text-lg leading-none">45</div><div className="text-[9px] uppercase font-bold text-gray-500 mt-1">Min</div></div>
                </div>
              </div>
              <Link to="/products" className="inline-block bg-[#d4af37] text-black text-xs px-6 py-3 rounded font-bold uppercase tracking-wider hover:bg-white transition-colors duration-300 shadow-md">Explore Now</Link>
            </div>
          </div>

          {/* Premium Quality Guarantee */}
          <div className="bg-[#1a1816] rounded-xl border border-[#2a2622] shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={100} className="text-[#d4af37]" />
            </div>
            <div className="relative z-10">
              <ShieldCheck className="text-[#d4af37] mb-3" size={32} />
              <h4 className="font-bold text-[#f5deb3] text-lg uppercase tracking-widest mb-2 font-serif">Authenticity Guaranteed</h4>
              <p className="text-gray-400 text-xs leading-relaxed mb-4 font-sans">Every bottle is sourced directly from certified distilleries and estates, ensuring 100% genuine quality.</p>
              <Link to="/about" className="text-[#d4af37] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors">
                Our Heritage <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Main Hero Banner */}
          <div className="bg-[#111] rounded-2xl overflow-hidden relative h-[400px] md:h-[480px] mb-10 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in group border border-[#2a2622]">
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-all duration-1000 ease-out" alt="Premium Spirits" />
            </div>
            <div className="relative z-10 p-10 md:p-16 max-w-2xl border-l-2 border-[#d4af37] ml-6 md:ml-12 backdrop-blur-[2px]">
              <div className="inline-block border border-[#d4af37]/50 text-[#d4af37] px-3 py-1 text-[10px] font-bold tracking-widest uppercase mb-5">
                MaramCraft Exclusives
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] uppercase tracking-tight text-white drop-shadow-2xl font-serif">
                The Art of <br/>
                <span className="text-[#d4af37] italic font-normal">Fine Spirits</span>
              </h1>
              <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base leading-relaxed font-sans">Discover our curated collection of premium whiskies, aged rums, and exquisite wines crafted for the true connoisseur.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-white text-black px-8 py-3.5 font-bold uppercase text-sm transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  Shop Collection <ArrowRight size={18} />
                </Link>
                <Link to="/categories" className="inline-flex items-center gap-2 bg-transparent border border-[#d4af37] hover:bg-[#d4af37]/10 text-[#d4af37] px-8 py-3.5 font-bold uppercase text-sm transition-all duration-300">
                  View cellars
                </Link>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: Truck, title: "Secure Delivery", sub: "Discreet packaging", color: "text-[#d4af37]" },
              { icon: ShieldCheck, title: "100% Genuine", sub: "Verified origin", color: "text-[#d4af37]" },
              { icon: GlassWater, title: "Rare Finds", sub: "Exclusive vintages", color: "text-[#d4af37]" },
              { icon: PhoneCall, title: "Sommelier Support", sub: "Expert guidance", color: "text-[#d4af37]" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1a1816] p-5 rounded-xl border border-[#2a2622] transition-all duration-300 hover:-translate-y-1 group flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 bg-[#2a2622] group-hover:bg-[#d4af37]`}>
                  <item.icon size={22} className={`transition-colors duration-300 ${item.color} group-hover:text-black`} />
                </div>
                <div className="flex flex-col justify-center h-full pt-1">
                  <h4 className="font-bold text-sm text-gray-200 leading-tight mb-1 uppercase tracking-wider">{item.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-tight font-sans">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sub Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {categories.slice(0, 3).map((cat, idx) => (
              <div key={cat.id} className="bg-[#1a1816] rounded-xl border border-[#2a2622] p-6 flex items-center gap-5 hover:border-[#d4af37]/50 transition-all duration-300 group cursor-pointer relative overflow-hidden" onClick={() => navigate(`/products?category=${cat.slug}`)}>
                <div className="w-20 h-20 shrink-0 bg-[#0f0e0d] border border-[#2a2622] rounded-full p-4 relative z-10 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                  {cat.name.toLowerCase().includes('wine') ? <Wine className="text-[#d4af37] w-10 h-10" /> : <Martini className="text-[#d4af37] w-10 h-10" />}
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-gray-200 text-lg mb-1 uppercase tracking-widest group-hover:text-[#d4af37] transition-colors">{cat.name}</h4>
                  <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1 font-sans">Discover curated selections</p>
                  <span className="inline-flex items-center text-[10px] font-bold text-[#d4af37] uppercase tracking-widest transition-colors">
                    View <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Trending Products */}
          <div className="mb-14 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8">
              <div>
                <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-widest mb-1">Sommelier's Choice</h4>
                <h2 className="text-2xl md:text-3xl font-bold text-white m-0 uppercase tracking-widest relative inline-block font-serif">
                  Featured Spirits
                  <div className="absolute -bottom-3 left-0 w-12 h-0.5 bg-[#d4af37]"></div>
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d4af37]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {featuredProducts.slice(0, 8).map(product => (
                  <div key={product.id} className="bg-[#1a1816] rounded-xl border border-[#2a2622] p-5 relative group hover:border-[#d4af37]/50 transition-all duration-300 flex flex-col h-full overflow-hidden">
                    {/* Discount Badge */}
                    {product.discount_price && (
                      <div className="absolute top-4 left-4 bg-[#8b0000] text-white text-[10px] font-bold px-2 py-1 z-10 uppercase tracking-wider">
                        Reserve
                      </div>
                    )}

                    <Link to={`/products/${product.slug}`} className="block h-48 md:h-56 flex items-center justify-center mb-6 shrink-0 p-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#221f1c] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      <img src={product.thumbnail || 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?w=300&q=80'} alt={product.name} className="max-w-full max-h-full object-contain relative z-10 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" />
                    </Link>
                    
                    <div className="flex flex-col flex-grow">
                      <div className="flex gap-0.5 mb-3 mt-auto justify-center">
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} className={`fill-current ${i < 4 ? 'text-[#d4af37]' : 'text-gray-700'}`} />)}
                      </div>
                      
                      <Link to={`/products/${product.slug}`} className="text-sm font-bold text-gray-200 line-clamp-2 mb-3 hover:text-[#d4af37] min-h-[40px] leading-relaxed transition-colors text-center font-serif tracking-wide">
                        {product.name}
                      </Link>
                      
                      <div className="flex items-center justify-center gap-2 mb-6">
                        {product.discount_price ? (
                          <>
                            <span className="font-bold text-[#d4af37] text-lg">₹{product.discount_price}</span>
                            <span className="text-xs text-gray-600 line-through font-sans">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="font-bold text-[#d4af37] text-lg">₹{product.price}</span>
                        )}
                      </div>
                      
                      <button 
                        className="w-full bg-transparent border border-[#d4af37] hover:bg-[#d4af37] text-[#d4af37] hover:text-black py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 mt-auto" 
                        onClick={() => handleBuyNow(product.id)}
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promo Banners Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="bg-[#111] border border-[#2a2622] overflow-hidden relative h-[240px] group">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600" className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" alt="Cocktails" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
              </div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-center max-w-[80%]">
                <div className="text-[#d4af37] font-bold text-[10px] uppercase tracking-widest mb-3">Mixology Essentials</div>
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight uppercase tracking-widest font-serif">Craft Perfect<br/>Cocktails</h3>
                <Link to="/products" className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-4 hover:text-[#d4af37] transition-colors w-max border-b border-[#d4af37] pb-1">
                  Shop Mixers <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="bg-[#111] border border-[#2a2622] overflow-hidden relative h-[240px] group">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=600" className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" alt="Wine Tasting" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              </div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end items-start">
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight uppercase tracking-widest font-serif drop-shadow-md">Vintage<br/>Wines</h3>
                <Link to="/products" className="bg-[#d4af37] text-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300 mt-2">
                  Explore Cellar
                </Link>
              </div>
            </div>
          </div>

          {/* Special Products */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center mb-8 border-b border-[#2a2622] pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white m-0 uppercase tracking-widest font-serif">
                  Distiller's Picks
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {deals.slice(0, 4).map(product => (
                  <div key={product.id} className="bg-[#1a1816] border border-[#2a2622] p-5 relative group hover:border-[#d4af37]/50 transition-all duration-300 flex flex-col h-full">
                    <Link to={`/products/${product.slug}`} className="block h-40 md:h-48 flex items-center justify-center mb-5 shrink-0 p-2 relative">
                      <img src={product.thumbnail || 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?w=200'} alt={product.name} className="max-w-full max-h-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-500 drop-shadow-lg" />
                    </Link>
                    
                    <div className="flex flex-col flex-grow items-center text-center">
                      <div className="w-8 h-0.5 bg-[#d4af37] mb-4"></div>
                      
                      <Link to={`/products/${product.slug}`} className="text-sm font-bold text-gray-200 line-clamp-2 mb-3 hover:text-[#d4af37] min-h-[40px] leading-relaxed font-serif tracking-wide">
                        {product.name}
                      </Link>
                      
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="font-bold text-[#d4af37] text-lg">₹{product.price}</span>
                      </div>
                      
                      <button 
                        className="w-full bg-transparent text-gray-400 border border-[#3a352f] hover:border-[#d4af37] hover:text-[#d4af37] py-2 px-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-300" 
                        onClick={() => handleBuyNow(product.id)}
                      >
                        Reserve Now
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
