import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
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
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-scrolling logic
  useEffect(() => {
    const autoScroll = (ref) => {
      if (ref.current) {
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        // If reached the end, scroll back to the start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          ref.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          ref.current.scrollBy({ left: 350, behavior: 'smooth' });
        }
      }
    };

    // Scroll every 3.5 seconds for deals and 4.5 seconds for categories
    const dealsInterval = setInterval(() => autoScroll(dealsScrollRef), 3500);
    const categoryInterval = setInterval(() => autoScroll(categoryScrollRef), 4500);

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
    <div className="pb-[60px] bg-transparent animate-fade-in">
      {/* Promotional Banner */}
      <div className="w-full h-[350px] bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.9)),url('https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80')] bg-center bg-cover bg-no-repeat flex items-center justify-center text-center mb-10 border-b-2 border-[var(--color-primary)]">
        <div>
          <h2 className="text-4xl text-white mb-3 font-[var(--font-heading)]">KDM | KERALA DOMESTIC MARKET</h2>
          <p className="text-[#ddd] text-base mb-5">Ultimate Kerala Modification Accessories. Exhausts, Alloys, Custom Parts & More.</p>
          <Link to="/products" className="btn btn-primary mt-2.5 inline-block">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories Row */}
      <section className="mb-10 container">
        <h3 className="text-[20px] text-[var(--color-text-bright)] m-0 font-semibold mb-4">Shop by Category</h3>
        <div className="relative flex items-center">
          <button className="hidden md:flex absolute z-10 bg-black/60 text-white border border-white/20 rounded-full w-[44px] h-[44px] items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:bg-[var(--color-primary)] hover:text-black hover:scale-110 -left-5" onClick={() => scrollContainer(categoryScrollRef, 'left')}>
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full" ref={categoryScrollRef}>
            {categories.slice(0, 8).map(cat => (
              <Link to={`/products?category=${cat.slug}`} key={cat.id} className="flex flex-col items-center gap-2 no-underline min-w-[120px] group">
                <div className="w-[100px] h-[100px] rounded-full border-2 border-[var(--border-color)] overflow-hidden bg-[var(--alt-bg)] flex items-center justify-center transition-all duration-300 group-hover:border-[var(--color-primary)] group-hover:scale-105">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[32px] text-[var(--color-text-dim)] uppercase">{cat.name.charAt(0)}</div>
                  )}
                </div>
                <span className="text-[var(--color-text-bright)] text-[14px] font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
          <button className="hidden md:flex absolute z-10 bg-black/60 text-white border border-white/20 rounded-full w-[44px] h-[44px] items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:bg-[var(--color-primary)] hover:text-black hover:scale-110 -right-5" onClick={() => scrollContainer(categoryScrollRef, 'right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Deals of the Day */}
      <section className="mb-10 container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[20px] text-[var(--color-text-bright)] m-0 font-semibold">Today's Deals <span className="text-[#cc0c39] text-[14px] ml-2">Up to 50% Off</span></h3>
          <Link to="/products?sort=price" className="flex items-center gap-1 text-[var(--color-primary)] text-[14px] no-underline hover:underline">See all deals <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[var(--color-text-muted)]">Loading deals...</div>
        ) : (
          <div className="relative flex items-center">
            <button className="hidden md:flex absolute z-10 bg-black/60 text-white border border-white/20 rounded-full w-[44px] h-[44px] items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:bg-[var(--color-primary)] hover:text-black hover:scale-110 -left-5" onClick={() => scrollContainer(dealsScrollRef, 'left')}>
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-5 overflow-x-auto pb-5 px-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full" ref={dealsScrollRef}>
              {deals.map((product) => (
                <div key={`deal-${product.id}`} className="min-w-[220px] max-w-[220px] shrink-0 flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-md)] overflow-hidden">
                  <div className="relative h-[200px] bg-[var(--bg-card)] flex items-center justify-center p-4 border-b border-[var(--border-color)] group">
                    <Link to={`/products/${product.slug}`} className="block h-full w-full">
                      <img
                        src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-[#cc0c39] text-white font-bold text-[11px] px-2 py-1 rounded-[2px]">Limited Time Deal</span>
                    </Link>
                    <button 
                      className="absolute top-3 right-3 bg-[rgba(22,16,13,0.7)] border border-white/10 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 z-10 hover:bg-[var(--color-primary)] hover:text-black hover:scale-110" 
                      onClick={(e) => handleAddToWishlist(e, product.id)}
                      title="Toggle Wishlist"
                    >
                      <Heart 
                        size={16} 
                        fill={wishlistIds.has(product.id) ? '#cc0c39' : 'none'} 
                        color={wishlistIds.has(product.id) ? '#cc0c39' : 'currentColor'} 
                      />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col grow">
                    <Link to={`/products/${product.slug}`} className="text-[14px] text-[var(--color-text-bright)] no-underline mb-1.5 line-clamp-2 leading-snug hover:text-[var(--color-primary)]" title={product.name}>
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="fill-[var(--color-primary)] text-[var(--color-primary)]" />
                      ))}
                      <span className="text-[#60a5fa] text-[12px] ml-1">842</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      {product.discount_price ? (
                        <>
                          <span className="text-[22px] font-bold text-[var(--color-text-bright)]">₹{product.discount_price}</span>
                          <span className="text-[13px] text-[var(--color-text-dim)] line-through">₹{product.price}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[22px] font-bold text-[var(--color-text-bright)]">₹{Math.floor(product.price * 0.8)}</span>
                          <span className="text-[13px] text-[var(--color-text-dim)] line-through">₹{product.price}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-auto flex flex-col gap-2">
                      <button className="btn btn-primary w-full p-2 text-[13px] flex justify-center items-center rounded-[20px]" onClick={() => handleBuyNow(product.id)} disabled={product.stock_status === 'Out of Stock'}>
                        <ShoppingBag size={12} className="mr-1" /> Quick Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="hidden md:flex absolute z-10 bg-black/60 text-white border border-white/20 rounded-full w-[44px] h-[44px] items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:bg-[var(--color-primary)] hover:text-black hover:scale-110 -right-5" onClick={() => scrollContainer(dealsScrollRef, 'right')}>
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </section>

      {/* Featured Products Grid */}
      <section className="mb-10 container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[20px] text-[var(--color-text-bright)] m-0 font-semibold">Featured Products</h3>
          <Link to="/products" className="flex items-center gap-1 text-[var(--color-primary)] text-[14px] no-underline hover:underline">See all <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[var(--color-text-muted)]">Loading products...</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-md)] overflow-hidden">
                <div className="relative h-[200px] bg-[var(--bg-card)] flex items-center justify-center p-4 border-b border-[var(--border-color)] group">
                  <Link to={`/products/${product.slug}`} className="block h-full w-full">
                    <img
                      src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                    {product.discount_price && (
                      <span className="absolute top-2.5 left-2.5 bg-[#cc0c39] text-white font-bold text-[11px] px-2 py-1 rounded-[2px]">Sale</span>
                    )}
                  </Link>
                  <button 
                    className="absolute top-3 right-3 bg-[rgba(22,16,13,0.7)] border border-white/10 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 z-10 hover:bg-[var(--color-primary)] hover:text-black hover:scale-110" 
                    onClick={(e) => handleAddToWishlist(e, product.id)}
                    title="Toggle Wishlist"
                  >
                    <Heart 
                      size={16} 
                      fill={wishlistIds.has(product.id) ? '#cc0c39' : 'none'} 
                      color={wishlistIds.has(product.id) ? '#cc0c39' : 'currentColor'} 
                    />
                  </button>
                </div>
                <div className="p-4 flex flex-col grow">
                  <Link to={`/products/${product.slug}`} className="text-[14px] text-[var(--color-text-bright)] no-underline mb-1.5 line-clamp-2 leading-snug hover:text-[var(--color-primary)]" title={product.name}>
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-[var(--color-primary)] text-[var(--color-primary)]" />
                    ))}
                    <span className="text-[#60a5fa] text-[12px] ml-1">1,204</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    {product.discount_price ? (
                      <>
                        <span className="text-[22px] font-bold text-[var(--color-text-bright)]">₹{product.discount_price}</span>
                        <span className="text-[13px] text-[var(--color-text-dim)] line-through">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-[22px] font-bold text-[var(--color-text-bright)]">₹{product.price}</span>
                    )}
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      className="btn btn-secondary w-full p-2 text-[13px] flex justify-center items-center rounded-[20px]"
                      onClick={() => addToCart(product.id, 1)}
                      disabled={product.stock_status === 'Out of Stock'}
                    >
                      {product.stock_status === 'Out of Stock' ? 'Sold Out' : 'Add to Cart'}
                    </button>
                    <button
                      className="btn btn-primary w-full p-2 text-[13px] flex justify-center items-center rounded-[20px]"
                      onClick={() => handleBuyNow(product.id)}
                      disabled={product.stock_status === 'Out of Stock'}
                    >
                      <ShoppingBag size={12} className="mr-1" /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
