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
    <div className="amazon-style-home animate-fade-in">
      {/* Promotional Banner */}
      <div className="promo-banner">
        <div className="promo-content">
          <h2>KDM | KERALA DOMESTIC MARKET</h2>
          <p>Ultimate Kerala Modification Accessories. Exhausts, Alloys, Custom Parts & More.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '10px' }}>
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories Row */}
      <section className="home-section container">
        <h3 className="section-title">Shop by Category</h3>
        <div className="scroll-wrapper">
          <button className="scroll-arrow left" onClick={() => scrollContainer(categoryScrollRef, 'left')}>
            <ChevronLeft size={24} />
          </button>
          <div className="category-scroll-container" ref={categoryScrollRef}>
            {categories.slice(0, 8).map(cat => (
              <Link to={`/products?category=${cat.slug}`} key={cat.id} className="category-card">
                <div className="category-img-container">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} />
                  ) : (
                    <div className="category-placeholder">{cat.name.charAt(0)}</div>
                  )}
                </div>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
          <button className="scroll-arrow right" onClick={() => scrollContainer(categoryScrollRef, 'right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Deals of the Day */}
      <section className="home-section container">
        <div className="section-header-row">
          <h3 className="section-title">Today's Deals <span style={{ color: '#cc0c39', fontSize: '14px', marginLeft: '8px' }}>Up to 50% Off</span></h3>
          <Link to="/products?sort=price" className="view-all-link">See all deals <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="loading-state">Loading deals...</div>
        ) : (
          <div className="scroll-wrapper">
            <button className="scroll-arrow left" onClick={() => scrollContainer(dealsScrollRef, 'left')}>
              <ChevronLeft size={24} />
            </button>
            <div className="deals-scroll-container" ref={dealsScrollRef}>
              {deals.map((product) => (
                <div key={`deal-${product.id}`} className="card product-card deal-card">
                  <div className="product-image-wrapper">
                    <Link to={`/products/${product.slug}`} style={{ display: 'block', height: '100%', width: '100%' }}>
                      <img
                        src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                      <span className="discount-tag">Limited Time Deal</span>
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
                        <>
                          <span className="current-price">₹{Math.floor(product.price * 0.8)}</span>
                          <span className="original-price">₹{product.price}</span>
                        </>
                      )}
                    </div>
                    <div className="card-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleBuyNow(product.id)} disabled={product.stock_status === 'Out of Stock'}>
                        <ShoppingBag size={12} style={{ marginRight: '4px' }} /> Quick Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="scroll-arrow right" onClick={() => scrollContainer(dealsScrollRef, 'right')}>
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </section>

      {/* Featured Products Grid */}
      <section className="home-section container">
        <div className="section-header-row">
          <h3 className="section-title">Featured Products</h3>
          <Link to="/products" className="view-all-link">See all <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
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
                  <Link to={`/products/${product.slug}`} className="product-card-title" title={product.name}>
                    {product.name}
                  </Link>
                  <div className="rating-row">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="star-filled" fill="var(--color-primary)" color="var(--color-primary)" />
                    ))}
                    <span className="rating-count">1,204</span>
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
        )}
      </section>

      <style>{`
        .amazon-style-home {
          padding-bottom: 60px;
          background-color: transparent;
        }
        
        /* Banner */
        .promo-banner {
          width: 100%;
          height: 350px;
          background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid var(--color-primary);
        }
        .promo-content h2 {
          font-size: 36px;
          color: #fff;
          margin-bottom: 12px;
          font-family: var(--font-heading);
        }
        .promo-content p {
          color: #ddd;
          font-size: 16px;
          margin-bottom: 20px;
        }

        /* Sections */
        .home-section {
          margin-bottom: 40px;
        }
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 20px;
          color: var(--color-text-bright);
          margin: 0;
          font-weight: 600;
        }
        .view-all-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-primary);
          font-size: 14px;
          text-decoration: none;
        }
        .view-all-link:hover {
          text-decoration: underline;
        }

        /* Scroll Wrapper & Arrows */
        .scroll-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .scroll-arrow {
          position: absolute;
          z-index: 10;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }
        .scroll-arrow:hover {
          background: var(--color-primary);
          color: #000;
          transform: scale(1.1);
        }
        .scroll-arrow.left {
          left: -20px;
        }
        .scroll-arrow.right {
          right: -20px;
        }
        @media (max-width: 768px) {
          .scroll-arrow {
            display: none; /* Hide on mobile so they can just swipe */
          }
        }

        /* Categories */
        .category-scroll-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          padding-left: 10px;
          padding-right: 10px;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          scroll-behavior: smooth;
        }
        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          min-width: 120px;
        }
        .category-img-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          overflow: hidden;
          background: var(--alt-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }
        .category-card:hover .category-img-container {
          border-color: var(--color-primary);
          transform: scale(1.05);
        }
        .category-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .category-placeholder {
          font-size: 32px;
          color: var(--color-text-dim);
          text-transform: uppercase;
        }
        .category-name {
          color: var(--color-text-bright);
          font-size: 14px;
          font-weight: 500;
        }

        /* Products Grid & Scroll */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .deals-scroll-container {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding-bottom: 20px;
          padding-left: 10px;
          padding-right: 10px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }
        .deals-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .deal-card {
          min-width: 220px;
          max-width: 220px;
          flex-shrink: 0;
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
          background: #cc0c39; /* Amazon-like red for discounts */
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
          color: #60a5fa; /* Amazon link color styled for dark mode */
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
          border-radius: 20px; /* Amazon style rounded buttons */
        }
        .loading-state {
          text-align: center;
          padding: 60px;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
