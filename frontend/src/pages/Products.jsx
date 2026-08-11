import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Filter, Search, RotateCcw, ArrowLeft, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());

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
  }, [selectedCategory, ordering, page]);

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
  };

  return (
    <div className="container animate-fade-in pt-[100px] mb-20">
      
      {/* Page Title */}
      <div className="mb-8 border-b border-[var(--border-color)] pb-6">
        <h1 className="text-4xl font-black text-[var(--color-text-bright)] mb-2">Shop Accessories</h1>
        <p className="text-[var(--color-text-muted)] text-lg">Browse our premium collection of automotive upgrades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        
        {/* Sidebar Filters - Sticky */}
        <aside className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-6 h-fit lg:sticky lg:top-[100px] shadow-xl">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4 mb-6">
            <h3 className="text-lg font-bold text-[var(--color-text-bright)] flex items-center gap-2 m-0"><Filter size={18} className="text-[var(--color-primary)]"/> Filters</h3>
            <button className="bg-transparent border-none text-[var(--color-primary)] cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[var(--color-primary-hover)] transition-colors p-0" onClick={resetFilters}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h4 className="text-xs uppercase tracking-widest text-[var(--color-text-dim)] mb-4 font-bold">Category</h4>
            <div className="flex flex-col gap-2">
              <button
                className={`text-left bg-transparent border-none text-sm cursor-pointer transition-all duration-300 py-1.5 px-2 rounded-md ${selectedCategory === '' ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)] hover:bg-[var(--alt-bg)]'}`}
                onClick={() => { setSelectedCategory(''); setPage(1); }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`text-left bg-transparent border-none text-sm cursor-pointer transition-all duration-300 py-1.5 px-2 rounded-md ${selectedCategory === cat.slug ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)] hover:bg-[var(--alt-bg)]'}`}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-widest text-[var(--color-text-dim)] mb-4 font-bold">Price Range (₹)</h4>
            <form onSubmit={handlePriceFilterSubmit} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input flex-1 min-w-[60px] px-3 py-2 text-sm"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-[var(--color-text-dim)]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input flex-1 min-w-[60px] px-3 py-2 text-sm"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary w-full py-2.5 text-xs">
                Apply Filter
              </button>
            </form>
          </div>
        </aside>

        {/* Products Display Area */}
        <main>
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-[var(--bg-card)] p-4 rounded-[var(--border-radius-lg)] border border-[var(--border-color)] shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex relative grow w-full md:max-w-[400px]">
              <input
                type="text"
                placeholder="Search products..."
                className="form-input pr-12 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white border-none w-8 h-8 rounded-md flex items-center justify-center cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {products.map((product) => (
                  <div key={product.id} className="flex flex-col h-full bg-transparent group/card">
                    <div className="relative h-[240px] bg-[var(--bg-card)] rounded-[var(--border-radius-lg)] border border-[var(--border-color)] flex items-center justify-center p-6 mb-4 overflow-hidden transition-all duration-500 group-hover/card:border-[var(--color-primary)] group-hover/card:shadow-[0_0_30px_rgba(220,38,38,0.15)] group/img">
                      <Link to={`/products/${product.slug}`} className="block h-full w-full flex items-center justify-center">
                        <img
                          src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover/img:scale-110 drop-shadow-xl"
                        />
                        {product.discount_price && (
                          <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Sale</span>
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
                      <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest font-bold mb-1.5">{product.category_name}</div>
                      <div className="flex justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-[var(--color-warning)] text-[var(--color-warning)]" />
                        ))}
                      </div>
                      <Link to={`/products/${product.slug}`} className="text-[15px] font-bold text-[var(--color-text-bright)] no-underline mb-2 line-clamp-1 hover:text-[var(--color-primary)] transition-colors" title={product.name}>
                        {product.name}
                      </Link>
                      <div className="flex items-center justify-center gap-2 mt-auto">
                        {product.discount_price ? (
                          <>
                            <span className="text-[17px] font-black text-[var(--color-text-bright)]">₹{product.discount_price}</span>
                            <span className="text-[12px] font-medium text-[var(--color-text-dim)] line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="text-[17px] font-black text-[var(--color-text-bright)]">₹{product.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-16 mb-8">
                  <button
                    className="btn btn-secondary px-5 py-2.5 text-[13px] flex items-center gap-2 rounded-full border-2"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ArrowLeft size={16} /> Prev
                  </button>
                  <span className="text-sm font-bold text-[var(--color-text-muted)] bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--border-color)] shadow-sm">
                    {page} <span className="text-[var(--color-text-dim)] font-medium mx-1">of</span> {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary px-5 py-2.5 text-[13px] flex items-center gap-2 rounded-full border-2"
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
