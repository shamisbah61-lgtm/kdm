import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ArrowRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
// Removed 3D imports

function RevealOnScroll({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} reveal-hidden ${isVisible ? 'reveal-visible' : ''}`}
    >
      {children}
    </div>
  );
}



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
        if (prodRes.success && prodRes.data.results && prodRes.data.results.length > 0) {
          setFeaturedProducts(prodRes.data.results);
        } else {
            // fallback if no featured flag
            const allProdRes = await apiRequest('/products/?page_size=8');
            if (allProdRes.success && allProdRes.data.results) {
                setFeaturedProducts(allProdRes.data.results);
            }
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

  const handleQuickAdd = async (e, productId) => {
    e.preventDefault(); // prevent navigation if wrapped in link
    e.stopPropagation();
    const res = await addToCart(productId, 1);
    if (res.success) {
      // Optional: show a quick toast or open cart drawer
      console.log('Added to cart');
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#111111] font-sans">
      
      {/* Hero Section */}
      <section className="w-full px-4 md:px-8 py-6 lg:py-10">
        <RevealOnScroll className="max-w-[1440px] mx-auto relative rounded-3xl overflow-hidden h-[65vh] md:h-[75vh] flex flex-col justify-center items-center text-center">
          
          {/* Image Background Element */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=2000" 
              alt="Automotive Parts Background" 
              className="w-full h-full object-cover object-center opacity-90"
            />
            {/* Dark gradient overlay to make text pop without a box */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
          </div>

          <div className="relative z-10 p-8 md:p-16 w-full max-w-5xl mx-auto flex flex-col items-center animate-slide-up mt-auto mb-8 md:mb-16">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.05] mb-4 md:mb-6 drop-shadow-lg">
              Pure Performance.
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-medium mb-8 md:mb-10 max-w-3xl mx-auto text-center drop-shadow-md">
              Precision engineering for the modern driver. Experience the pinnacle of KDM aftermarket parts.
            </p>
            <div className="flex gap-5 md:gap-6 mt-4">
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center px-12 py-4 md:px-14 md:py-4.5 bg-white text-[#111111] rounded-full font-bold text-[17px] md:text-lg transition-all hover:bg-gray-100 hover:scale-105 shadow-xl min-w-[160px]"
              >
                Buy
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center px-12 py-4 md:px-14 md:py-4.5 bg-transparent text-white rounded-full font-semibold text-[17px] md:text-lg transition-all hover:bg-white/15 hover:scale-105 border-2 border-white/40 backdrop-blur-md min-w-[160px]"
              >
                Learn more
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Categories Section */}
      <section className="w-full px-6 md:px-10 py-20 lg:py-32 bg-white">
        <RevealOnScroll className="max-w-[1440px] mx-auto">
          <div className="flex flex-col items-center justify-center mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#111111]">Which part is right for you?</h2>
            <Link to="/categories" className="mt-4 text-[17px] text-[#0066CC] hover:underline transition-colors flex items-center gap-1">
              View all categories <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`} className="group flex flex-col items-center justify-center text-center bg-[#F5F5F7] py-12 px-6 rounded-[28px] hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out border border-transparent hover:border-black/5 h-full">
                  <h3 className="text-[#111111] font-semibold text-xl md:text-2xl tracking-tight mb-3">{cat.name}</h3>
                  <span className="text-[#0066CC] text-sm font-medium group-hover:underline">Shop {cat.name}</span>
                </Link>
              ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* Featured Products */}
      <section className="w-full px-6 md:px-10 py-20 lg:py-32 bg-[#FBFBFD]">
        <RevealOnScroll className="max-w-[1440px] mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#111111] mb-4">Latest Arrivals.</h2>
            <p className="text-xl text-[#6B6B6B] max-w-2xl">The newest additions to our collection. Thoughtfully designed and carefully crafted.</p>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#111111] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map(product => (
                <div key={product.id} className="group relative flex flex-col bg-white rounded-3xl p-4 sm:p-5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 h-full border border-transparent hover:border-black/5">
                  <Link to={`/products/${product.slug}`} className="absolute inset-0 z-0 rounded-3xl" aria-label={`View ${product.name}`}></Link>
                  
                  <div className="relative z-0 w-full aspect-[4/5] mb-5 rounded-2xl bg-[#FBFBFD] overflow-hidden flex items-center justify-center p-6 transition-colors duration-500 group-hover:bg-white">
                    {product.discount_price && (
                      <span className="absolute top-3 left-3 bg-[#E83422] text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm tracking-widest uppercase">Sale</span>
                    )}
                    <img 
                      src={product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]" 
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1 text-left px-1 relative z-0 pointer-events-none">
                    <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">{product.category_name || 'Accessories'}</div>
                    <h3 className="text-[17px] font-semibold text-[#1D1D1F] line-clamp-2 leading-snug mb-1">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-4 opacity-80">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-[#F59E0B] text-[#F59E0B]" />)}
                    </div>
                    
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#F5F5F7] pointer-events-auto relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-0.5">Price</span>
                        <div className="flex items-center gap-2">
                          {product.discount_price ? (
                            <>
                              <span className="text-[16px] font-bold text-[#1D1D1F]">₹{product.discount_price}</span>
                              <span className="text-[13px] font-medium text-[#86868B] line-through">₹{product.price}</span>
                            </>
                          ) : (
                            <span className="text-[16px] font-bold text-[#1D1D1F]">₹{product.price}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        className="bg-[#F5F5F7] hover:bg-[#1D1D1F] text-[#1D1D1F] hover:text-white text-[13px] font-semibold py-2 px-5 rounded-full transition-all active:scale-95"
                        onClick={(e) => handleQuickAdd(e, product.id)}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-16 flex justify-center">
            <Link to="/products" className="text-[#0066CC] hover:underline text-[17px] flex items-center gap-1 transition-colors">
              Shop all products <ArrowRight size={16} />
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* Editorial Split Section */}
      <section className="w-full px-6 md:px-10 py-20 lg:py-32 bg-white">
        <RevealOnScroll className="max-w-[1440px] mx-auto rounded-3xl overflow-hidden bg-[#FBFBFD] flex flex-col md:flex-row items-stretch gap-0">
          <div className="md:w-1/2 p-12 md:p-20 lg:p-28 flex flex-col justify-center text-center md:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-[#111111] leading-tight">
              Master the<br/>track.
            </h2>
            <p className="text-[#6B6B6B] text-xl leading-relaxed mb-10 max-w-md mx-auto md:mx-0">
              We believe in creating parts that withstand the ultimate test. Precision engineering meets aggressive styling.
            </p>
            <Link to="/about" className="inline-flex items-center justify-center md:justify-start text-[17px] text-[#0066CC] hover:underline gap-1 transition-colors">
              Discover Our Story <ArrowRight size={16} />
            </Link>
          </div>
          <div className="md:w-1/2 min-h-[500px] relative flex items-center justify-center bg-[#F5F5F7]">
            <img 
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80" 
              alt="Performance Engineering" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-95 transition-transform duration-1000 hover:scale-105"
            />
          </div>
        </RevealOnScroll>
      </section>

    </div>
  );
}
