import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Filter, Search, RotateCcw, ArrowLeft, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ordering, setOrdering] = useState(searchParams.get('sort') || '-created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Sync state with URL if URL changes externally (e.g. Navbar search)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setOrdering(searchParams.get('sort') || '-created_at');
  }, [searchParams]);

  const { addToCart, showToast, fetchWishlistCount } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

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

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await apiRequest('/categories/');
      if (res.success) {
        setCategories(res.data.results || res.data || []);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products whenever filters change
  const fetchProducts = async () => {
    setLoading(true);
    let params = `?page=${page}&ordering=${ordering}`;
    if (search) params += `&search=${encodeURIComponent(search)}`;
    if (selectedCategory) params += `&category_slug=${selectedCategory}`;
    if (minPrice) params += `&min_price=${minPrice}`;
    if (maxPrice) params += `&max_price=${maxPrice}`;

    const res = await apiRequest(`/products/${params}`);
    if (res.success && res.data.results) {
      setProducts(res.data.results);
      setCount(res.data.count);
      
      // Calculate total pages (page size in settings is 10)
      const pageSize = 10;
      setTotalPages(Math.ceil(res.data.count / pageSize) || 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts();
  }, [selectedCategory, ordering, page, searchParams.get('search'), searchParams.get('category')]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setOrdering('-created_at');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container animate-fade-in pt-6 mb-20">
      
      {/* Page Title */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-wide">Shop Accessories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        
        {/* Sidebar Filters - Sticky */}
        <aside className="bg-white border border-gray-200 p-8 h-fit lg:sticky lg:top-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4 mb-6">
            <h3 className="text-lg font-bold text-[var(--color-text-bright)] flex items-center gap-2 m-0"><Filter size={18} className="text-[var(--color-primary)]"/> Filters</h3>
            <button className="bg-transparent border-none text-[var(--color-primary)] cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[var(--color-primary-hover)] transition-colors p-0" onClick={resetFilters}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h4 className="text-[13px] uppercase tracking-widest text-gray-400 mb-4 font-bold border-b border-gray-100 pb-2 text-center">Category</h4>
            <div className="flex flex-col gap-2">
              <button
                className={`text-center bg-transparent border-none text-[15px] font-medium cursor-pointer transition-all duration-300 py-2.5 px-3 rounded-xl ${selectedCategory === '' ? 'text-[#ff3333] font-bold bg-[#ff3333]/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => { setSelectedCategory(''); setPage(1); }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`text-center bg-transparent border-none text-[15px] font-medium cursor-pointer transition-all duration-300 py-2.5 px-3 rounded-xl ${selectedCategory === cat.slug ? 'text-[#ff3333] font-bold bg-[#ff3333]/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-4">
            <h4 className="text-[13px] uppercase tracking-widest text-gray-400 mb-4 font-bold border-b border-gray-100 pb-2 text-center">Price Range (₹)</h4>
            <form onSubmit={handlePriceFilterSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-300 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-[#222] hover:bg-[#ff3333] text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors">
                Apply Filter
              </button>
            </form>
          </div>
        </aside>

        {/* Products Display Area */}
        <main>
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-gray-50 p-3 border border-gray-200">
            <form onSubmit={handleSearchSubmit} className="flex relative grow w-full md:max-w-[400px]">
              <input
                type="text"
                placeholder="Search products..."
                className="form-input pr-12 w-full border-gray-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 bg-[#333] text-white border-none px-4 flex items-center justify-center cursor-pointer hover:bg-[#ff3333] transition-colors">
                <Search size={16} />
              </button>
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label htmlFor="sort-select" className="text-sm font-semibold text-[var(--color-text-dim)] uppercase tracking-wider hidden md:block">Sort:</label>
              <select
                id="sort-select"
                className="form-input py-2.5 px-4 min-w-[180px] w-full md:w-auto font-medium"
                value={ordering}
                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
              >
                <option value="-created_at">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="text-[13px] font-medium text-[var(--color-text-dim)] mb-6 tracking-wide">
            SHOWING <span className="text-[var(--color-text-bright)] font-bold">{products.length}</span> OF <span className="text-[var(--color-text-bright)] font-bold">{count}</span> PRODUCTS
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-[var(--color-text-muted)]">
              <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
              <p className="font-semibold tracking-widest uppercase text-sm">Loading catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 px-6 bg-[var(--alt-bg)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--border-color)] shadow-inner">
              <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)] shadow-sm">
                <Search size={24} className="text-[var(--color-text-dim)]" />
              </div>
              <h3 className="mb-2 font-black text-2xl text-[var(--color-text-bright)]">No products found</h3>
              <p className="text-[var(--color-text-muted)] mb-6">We couldn't find anything matching your current filters.</p>
              <button onClick={resetFilters} className="btn btn-primary">Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="group relative flex flex-col bg-white rounded-3xl p-4 sm:p-5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 h-full border border-transparent hover:border-black/5">
                    
                    <Link to={`/products/${product.slug}`} className="absolute inset-0 z-0 rounded-3xl" aria-label={`View ${product.name}`}></Link>
                    
                    <div className="relative z-0 w-full aspect-[4/5] mb-5 rounded-2xl bg-[#FBFBFD] overflow-hidden flex items-center justify-center p-6 transition-colors duration-500 group-hover:bg-white">
                      {product.discount_price && (
                        <span className="absolute top-3 left-3 bg-[#E83422] text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm tracking-widest uppercase">Sale</span>
                      )}
                      
                      {/* Wishlist Button Overlay */}
                      <button 
                        className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full border border-[#EAEAEA] text-gray-500 flex items-center justify-center hover:bg-white hover:text-[#E83422] hover:border-[#E83422] transition-colors shadow-sm"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToWishlist(e, product.id); }}
                        title="Toggle Wishlist"
                      >
                        <Heart 
                          size={14} 
                          fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} 
                          className={wishlistIds.has(product.id) ? 'text-[#E83422]' : ''}
                        />
                      </button>

                      <img 
                        src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400'} 
                        alt={product.name} 
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]" 
                      />
                    </div>
                    
                    <div className="flex flex-col flex-1 text-left px-1 relative z-0 pointer-events-none">
                      <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">{product.category_name || 'Accessories'}</div>
                      <h3 className="text-[16px] md:text-[17px] font-semibold text-[#1D1D1F] line-clamp-2 leading-snug mb-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-4 opacity-80">
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-[#F59E0B] text-[#F59E0B]" />)}
                      </div>
                      
                      <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#F5F5F7] pointer-events-auto relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-0.5">Price</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {product.discount_price ? (
                              <>
                                <span className="text-[16px] font-bold text-[#1D1D1F]">₹{product.discount_price}</span>
                                <span className="text-[12px] font-medium text-[#86868B] line-through">₹{product.price}</span>
                              </>
                            ) : (
                              <span className="text-[16px] font-bold text-[#1D1D1F]">₹{product.price}</span>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          className="bg-[#F5F5F7] hover:bg-[#1D1D1F] text-[#1D1D1F] hover:text-white text-[13px] font-semibold py-2 px-4 rounded-full transition-all active:scale-95 shrink-0"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id, 1); }}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-16 mb-8">
                  <button
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ArrowLeft size={16} /> Prev
                  </button>
                  <span className="text-sm font-bold text-[var(--color-text-muted)] bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--border-color)] shadow-sm">
                    {page} <span className="text-[var(--color-text-dim)] font-medium mx-1">of</span> {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
