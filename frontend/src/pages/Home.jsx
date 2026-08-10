import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Heart, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const { addToCart, showToast, fetchWishlistCount } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const categoryScrollRef = useRef(null);
  const dealsScrollRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const autoScroll = (ref) => {
      if (ref.current) {
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          ref.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          ref.current.scrollBy({ left: 350, behavior: 'smooth' });
        }
      }
    };

    const dealsInterval = setInterval(() => autoScroll(dealsScrollRef), 4000);
    const categoryInterval = setInterval(() => autoScroll(categoryScrollRef), 5000);

    return () => {
      clearInterval(dealsInterval);
      clearInterval(categoryInterval);
    };
  }, []);

  const handleBuyNow = async (productId) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      navigate('/checkout');
    }
  };

  const handleAddToWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast('Please login to use Wishlist.', 'error');
      navigate('/login');
      return;
    }

    const isWishlisted = wishlistIds.has(productId);

    if (isWishlisted) {
      const res = await apiRequest(`/wishlist/remove-product/${productId}/`, {
        method: 'DELETE',
      });
      if (res.success) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        showToast('Removed from wishlist.', 'success');
        fetchWishlistCount();
      }
    } else {
      const res = await apiRequest('/wishlist/', {
        method: 'POST',
        body: { product_id: productId },
      });
      if (res.success) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
        showToast('Added to wishlist!', 'success');
        fetchWishlistCount();
      } else {
        showToast(res.message || 'Error updating wishlist.', 'error');
      }
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        const res = await apiRequest('/wishlist/');
        if (res.success) {
          const ids = new Set(res.data.map(item => item.product.id));
          setWishlistIds(ids);
        }
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await apiRequest('/products/?featured=true&page_size=8');
        if (prodRes.success && prodRes.data.results) {
          setFeaturedProducts(prodRes.data.results);
        }
        const dealsRes = await apiRequest('/products/?page_size=12&ordering=price');
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

  return (
    <div className="pb-20 bg-transparent animate-fade-in pt-[80px]">
      {/* Cinematic Hero Banner */}
      <div className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1920&q=80" alt="Hero Background" className="absolute inset-0 w-full h-full object-cover transform scale-105 animate-[zoom-in_20s_infinite_alternate]" />
        
        <div className="container relative z-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-6">
            <Sparkles size={16} className="text-[var(--color-primary)]" />
            <span>Premium Automotive Upgrades</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight max-w-4xl drop-shadow-2xl">
            ELEVATE YOUR <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#fca5a5]">DRIVING EXPERIENCE</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl drop-shadow-lg font-light">
            Discover the ultimate collection of KDM modification accessories. High-performance exhausts, premium alloys, and custom aero parts.
          </p>
          <div className="flex gap-4">
            <Link to="/products" className="btn btn-primary !px-10 !py-4 !text-base shadow-[0_0_40px_rgba(220,38,38,0.5)]">
              Explore Collection
            </Link>
          </div>
        </div>
        
        {/* Sleek bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-main)] to-transparent z-10"></div>
      </div>

      {/* Categories Row */}
      <section className="mb-20 container">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl md:text-3xl text-[var(--color-text-bright)] m-0 font-bold flex items-center gap-3">
            <TrendingUp size={28} className="text-[var(--color-primary)]" />
            Shop by Category
          </h3>
        </div>
        
        <div className="relative group/scroll">
          <button className="hidden md:flex absolute z-10 bg-[var(--bg-card)]/80 backdrop-blur-md text-[var(--color-text-bright)] border border-[var(--border-color)] rounded-full w-12 h-12 items-center justify-center cursor-pointer transition-all duration-300 shadow-xl hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] hover:scale-110 -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/scroll:opacity-100" onClick={() => scrollContainer(categoryScrollRef, 'left')}>
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-6 overflow-x-auto pb-6 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full" ref={categoryScrollRef}>
            {categories.slice(0, 10).map(cat => (
              <Link to={`/products?category=${cat.slug}`} key={cat.id} className="flex flex-col items-center gap-4 no-underline min-w-[140px] group">
                <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-full border border-[var(--border-color)] overflow-hidden bg-[var(--bg-card)] flex items-center justify-center transition-all duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] group-hover:border-[var(--color-primary)]">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="text-4xl text-[var(--color-text-dim)] font-black uppercase">{cat.name.charAt(0)}</div>
                  )}
                </div>
                <span className="text-[var(--color-text-bright)] text-[15px] font-semibold tracking-wide uppercase group-hover:text-[var(--color-primary)] transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
          
          <button className="hidden md:flex absolute z-10 bg-[var(--bg-card)]/80 backdrop-blur-md text-[var(--color-text-bright)] border border-[var(--border-color)] rounded-full w-12 h-12 items-center justify-center cursor-pointer transition-all duration-300 shadow-xl hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] hover:scale-110 -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/scroll:opacity-100" onClick={() => scrollContainer(categoryScrollRef, 'right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Deals of the Day */}
      <section className="mb-24 container">
        <div className="flex justify-between items-end mb-8 border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm tracking-widest uppercase mb-2">
              <Zap size={16} fill="currentColor" /> Flash Deals
            </div>
            <h3 className="text-3xl md:text-4xl text-[var(--color-text-bright)] m-0 font-extrabold tracking-tight">Today's Exclusives</h3>
          </div>
          <Link to="/products?sort=price" className="hidden md:flex items-center gap-2 text-[var(--color-text-muted)] text-sm font-semibold no-underline hover:text-[var(--color-primary)] transition-colors bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--border-color)] hover:border-[var(--color-primary)]">
            View All Deals <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--color-text-muted)] flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            <p>Loading premium deals...</p>
          </div>
        ) : (
          <div className="relative group/scroll2">
            <button className="hidden md:flex absolute z-10 bg-[var(--bg-card)]/80 backdrop-blur-md text-[var(--color-text-bright)] border border-[var(--border-color)] rounded-full w-12 h-12 items-center justify-center cursor-pointer transition-all duration-300 shadow-xl hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] hover:scale-110 -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/scroll2:opacity-100" onClick={() => scrollContainer(dealsScrollRef, 'left')}>
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-6 overflow-x-auto pb-10 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full" ref={dealsScrollRef}>
              {deals.map((product) => (
                <div key={`deal-${product.id}`} className="min-w-[260px] max-w-[260px] shrink-0 flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group/card">
                  <div className="relative h-[240px] bg-gradient-to-b from-[var(--alt-bg)] to-[var(--bg-card)] flex items-center justify-center p-6 group/img">
                    <Link to={`/products/${product.slug}`} className="block h-full w-full flex items-center justify-center">
                      <img
                        src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain transition-all duration-500 group-hover/img:scale-110 group-hover/img:rotate-2 drop-shadow-xl"
                      />
                      <div className="absolute top-4 left-4 bg-[var(--color-primary)] text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(220,38,38,0.4)]">
                        Save {Math.round(((product.price - (product.discount_price || product.price*0.8)) / product.price) * 100)}%
                      </div>
                    </Link>
                    <button 
                      className="absolute top-4 right-4 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--color-text-muted)] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 z-10 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] hover:scale-110 shadow-lg" 
                      onClick={(e) => handleAddToWishlist(e, product.id)}
                      title="Toggle Wishlist"
                    >
                      <Heart 
                        size={18} 
                        fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} 
                        className={wishlistIds.has(product.id) ? 'text-[var(--color-primary)] hover:text-white' : ''} 
                      />
                    </button>
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <div className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-widest font-bold mb-2">{product.category_name}</div>
                    <Link to={`/products/${product.slug}`} className="text-[16px] font-bold text-[var(--color-text-bright)] no-underline mb-3 line-clamp-2 leading-snug group-hover/card:text-[var(--color-primary)] transition-colors" title={product.name}>
                      {product.name}
                    </Link>
                    
                    <div className="flex items-baseline gap-3 mb-6 mt-auto pt-4 border-t border-[var(--border-color)]">
                      {product.discount_price ? (
                        <>
                          <span className="text-2xl font-black text-[var(--color-text-bright)]">₹{product.discount_price}</span>
                          <span className="text-sm font-medium text-[var(--color-text-dim)] line-through decoration-red-500/50">₹{product.price}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-black text-[var(--color-text-bright)]">₹{Math.floor(product.price * 0.8)}</span>
                          <span className="text-sm font-medium text-[var(--color-text-dim)] line-through decoration-red-500/50">₹{product.price}</span>
                        </>
                      )}
                    </div>
                    
                    <button className="btn btn-secondary w-full group-hover/card:bg-[var(--color-primary)] group-hover/card:text-white group-hover/card:border-[var(--color-primary)] transition-all duration-300" onClick={() => handleBuyNow(product.id)} disabled={product.stock_status === 'Out of Stock'}>
                      <ShoppingBag size={16} className="mr-2" /> {product.stock_status === 'Out of Stock' ? 'Out of Stock' : 'Quick Checkout'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="hidden md:flex absolute z-10 bg-[var(--bg-card)]/80 backdrop-blur-md text-[var(--color-text-bright)] border border-[var(--border-color)] rounded-full w-12 h-12 items-center justify-center cursor-pointer transition-all duration-300 shadow-xl hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] hover:scale-110 -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/scroll2:opacity-100" onClick={() => scrollContainer(dealsScrollRef, 'right')}>
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </section>

      {/* Featured Products Grid */}
      <section className="mb-20 container">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-5xl text-[var(--color-text-bright)] font-black mb-4">Top Rated <span className="text-[var(--color-primary)]">Collection</span></h3>
          <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto text-lg">Our most sought-after performance parts and aesthetic upgrades, curated for enthusiasts.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--color-text-muted)]">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex flex-col h-full bg-transparent group/card">
                <div className="relative h-[280px] bg-[var(--bg-card)] rounded-[var(--border-radius-lg)] border border-[var(--border-color)] flex items-center justify-center p-6 mb-5 overflow-hidden transition-all duration-500 group-hover/card:border-[var(--color-primary)] group-hover/card:shadow-[0_0_30px_rgba(220,38,38,0.15)] group/img">
                  <Link to={`/products/${product.slug}`} className="block h-full w-full flex items-center justify-center">
                    <img
                      src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover/img:scale-110 drop-shadow-2xl"
                    />
                    {product.discount_price && (
                      <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">Sale</span>
                    )}
                  </Link>
                  
                  {/* Hover Actions overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover/img:opacity-100 transition-all duration-300">
                    <button 
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white hover:scale-110 transition-all duration-300 shadow-xl"
                      onClick={() => addToCart(product.id, 1)}
                      title="Add to Cart"
                    >
                      <ShoppingBag size={20} />
                    </button>
                    <button 
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white hover:scale-110 transition-all duration-300 shadow-xl"
                      onClick={(e) => handleAddToWishlist(e, product.id)}
                      title="Toggle Wishlist"
                    >
                      <Heart 
                        size={20} 
                        fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} 
                        className={wishlistIds.has(product.id) ? 'text-[var(--color-primary)]' : ''}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col grow px-2 text-center">
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-[var(--color-warning)] text-[var(--color-warning)]" />
                    ))}
                  </div>
                  <Link to={`/products/${product.slug}`} className="text-[17px] font-bold text-[var(--color-text-bright)] no-underline mb-2 line-clamp-1 hover:text-[var(--color-primary)] transition-colors" title={product.name}>
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-center gap-3 mt-auto">
                    {product.discount_price ? (
                      <>
                        <span className="text-[18px] font-black text-[var(--color-text-bright)]">₹{product.discount_price}</span>
                        <span className="text-[13px] font-medium text-[var(--color-text-dim)] line-through">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-[18px] font-black text-[var(--color-text-bright)]">₹{product.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link to="/products" className="btn btn-secondary !px-8 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]">
            View All Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
