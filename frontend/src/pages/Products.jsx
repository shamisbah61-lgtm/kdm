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
    <div className="container animate-fade-in">
      <div className="shop-layout">
        
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="sidebar-header">
            <h3><Filter size={16} /> Filters</h3>
            <button className="reset-btn" onClick={resetFilters}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4>Category</h4>
            <div className="category-list">
              <button
                className={`category-filter-item ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(''); setPage(1); }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-filter-item ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-group">
            <h4>Price Range (₹)</h4>
            <form onSubmit={handlePriceFilterSubmit} className="price-filter-form">
              <input
                type="number"
                placeholder="Min"
                className="form-input price-input"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                className="form-input price-input"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-apply-price">
                Apply
              </button>
            </form>
          </div>
        </aside>

        {/* Products Display Area */}
        <main className="shop-main">
          {/* Top Control Bar */}
          <div className="shop-controls">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search accessories, exhausts, alloys..."
                className="form-input search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <Search size={18} />
              </button>
            </form>

            <div className="sort-wrapper">
              <label htmlFor="sort-select">Sort By:</label>
              <select
                id="sort-select"
                className="form-input sort-select"
                value={ordering}
                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
              >
                <option value="-created_at">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="results-info">
            Showing {products.length} of {count} products
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading-state">Loading catalog...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try resetting filters or adjusting search parameters.</p>
            </div>
          ) : (
            <>
              <div className="grid-cols-3">
                {products.map((product) => (
                  <div key={product.id} className="card product-card">
                    <div className="product-image-wrapper">
                      <Link to={`/products/${product.slug}`} style={{ display: 'block', height: '100%', width: '100%' }}>
                        <img
                          src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'}
                          alt={product.name}
                          className="product-thumbnail"
                        />
                        {product.discount_price && (
                          <span className="discount-tag">Sale</span>
                        )}
                      </Link>
                      <button 
                        className="quick-wishlist-btn" 
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
                    <div className="product-card-body">
                      <span className="product-card-category">{product.category_name}</span>
                      <Link to={`/products/${product.slug}`} className="product-card-title" title={product.name}>
                        {product.name}
                      </Link>

                      <div className="rating-row">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="star-filled" fill="var(--color-primary)" color="var(--color-primary)" />
                        ))}
                        <span className="rating-count">842</span>
                      </div>

                      <div className="price-container">
                        {product.discount_price ? (
                          <>
                            <span className="current-price">₹{product.discount_price}</span>
                            <span className="original-price">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="current-price">₹{product.price}</span>
                        )}
                      </div>

                      <div className="card-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => addToCart(product.id, 1)}
                          disabled={product.stock_status === 'Out of Stock'}
                        >
                          {product.stock_status === 'Out of Stock' ? 'Sold Out' : 'Add to Cart'}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleBuyNow(product.id)}
                          disabled={product.stock_status === 'Out of Stock'}
                        >
                          <ShoppingBag size={12} style={{ marginRight: '4px' }} /> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    className="btn btn-secondary pagination-btn"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ArrowLeft size={14} /> Prev
                  </button>
                  <span className="pagination-label">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary pagination-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        .shop-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          margin-top: 20px;
        }
        @media (max-width: 992px) {
          .shop-layout {
            grid-template-columns: 1fr;
          }
        }
        .shop-sidebar {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .reset-btn {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .filter-group {
          margin-bottom: 32px;
        }
        .filter-group h4 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-bright);
          margin-bottom: 16px;
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .category-filter-item {
          text-align: left;
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition-smooth);
          padding: 4px 0;
        }
        .category-filter-item:hover, .category-filter-item.active {
          color: var(--color-primary);
          padding-left: 6px;
        }
        .price-filter-form {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .price-input {
          flex: 1;
          min-width: 60px;
          padding: 8px 12px;
        }
        .price-separator {
          color: var(--color-text-dim);
        }
        .btn-apply-price {
          width: 100%;
          padding: 8px;
          font-size: 12px;
          margin-top: 8px;
        }
        .shop-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-form {
          display: flex;
          position: relative;
          flex-grow: 1;
          max-width: 480px;
        }
        .search-input {
          padding-right: 48px;
        }
        .search-btn {
          position: absolute;
          right: 4px;
          top: 4px;
          bottom: 4px;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0 16px;
        }
        .search-btn:hover {
          color: var(--color-primary);
        }
        .sort-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sort-wrapper label {
          font-size: 14px;
          color: var(--color-text-muted);
          white-space: nowrap;
        }
        .sort-select {
          padding: 10px 16px;
          min-width: 180px;
        }
        .results-info {
          font-size: 13px;
          color: var(--color-text-dim);
          margin-bottom: 24px;
        }
        .grid-cols-3 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        .product-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          overflow: hidden;
        }
        .product-image-wrapper {
          position: relative;
          height: 200px;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .product-thumbnail {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.2s;
        }
        .product-image-wrapper:hover .product-thumbnail {
          transform: scale(1.05);
        }
        .quick-wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(22, 16, 13, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 5;
        }
        .quick-wishlist-btn:hover {
          background: var(--color-primary);
          color: #000;
          transform: scale(1.1);
        }
        .discount-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #cc0c39;
          color: #fff;
          font-weight: bold;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 2px;
        }
        .product-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .product-card-category {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--color-text-dim);
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .product-card-title {
          font-size: 14px;
          color: var(--color-text-bright);
          text-decoration: none;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
        .product-card-title:hover {
          color: var(--color-primary);
        }
        .rating-row {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 8px;
        }
        .rating-count {
          color: #60a5fa;
          font-size: 12px;
          margin-left: 4px;
        }
        .price-container {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 16px;
        }
        .current-price {
          font-size: 22px;
          font-weight: bold;
          color: var(--color-text-bright);
        }
        .original-price {
          font-size: 13px;
          color: var(--color-text-dim);
          text-decoration: line-through;
        }
        .card-actions {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .btn-sm {
          width: 100%;
          padding: 8px;
          font-size: 13px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 20px;
        }
        .empty-state {
          text-align: center;
          padding: 80px 24px;
          background: var(--alt-bg);
          border-radius: var(--border-radius-lg);
          border: 1px dashed var(--border-color);
        }
        .empty-state h3 {
          margin-bottom: 8px;
        }
        .pagination-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 48px;
        }
        .pagination-btn {
          padding: 8px 16px;
          font-size: 13px;
        }
        .pagination-label {
          font-size: 13px;
          color: var(--color-text-muted);
        }
        .loading-state {
          text-align: center;
          padding: 100px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}
