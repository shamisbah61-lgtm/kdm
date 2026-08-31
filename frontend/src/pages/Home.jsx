import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ArrowRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';

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
        <RevealOnScroll className="max-w-[1440px] mx-auto relative rounded-3xl overflow-hidden h-[65vh] md:h-[75vh] flex flex-col justify-center items-center bg-[#FBFBFD] text-center">
          <div className="relative z-10 p-8 md:p-16 lg:p-24 max-w-4xl flex flex-col items-center animate-slide-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[#111111] leading-[1.05] mb-6">
              Pure Performance.
            </h1>
            <p className="text-lg md:text-2xl text-[#111111] font-normal mb-10 max-w-2xl">
              Precision engineering for the modern driver. Experience the pinnacle of KDM aftermarket parts.
            </p>
            <div className="flex gap-4">
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center px-8 py-3 bg-[#111111] text-white rounded-full font-medium text-[15px] transition-all hover:bg-[#333333] shadow-sm"
              >
                Buy
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#111111] rounded-full font-medium text-[15px] transition-all hover:bg-[#F5F5F7] shadow-sm border border-[#EAEAEA]"
              >
                Learn more
              </Link>
            </div>
          </div>
          {/* Subtle product imagery below text, like Apple */}
          <div className="absolute bottom-0 w-full max-w-3xl flex justify-center translate-y-[20%] opacity-90 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <img 
              src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1200&bg=FBFBFD" 
              alt="Hero Product" 
              className="w-[80%] h-auto object-contain mix-blend-multiply"
            />
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
            {categories.slice(0, 4).map((cat, idx) => {
              const fallbackImages = [
                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600&bg=FBFBFD",
                "https://images.unsplash.com/photo-1599818815777-62f7e7f1eab6?auto=format&fit=crop&q=80&w=600&bg=FBFBFD",
                "https://images.unsplash.com/photo-1621215418197-0fc5451eb9dc?auto=format&fit=crop&q=80&w=600&bg=FBFBFD",
                "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=600&bg=FBFBFD"
              ];
              return (
                <Link key={cat.id} to={`/products?category=${cat.slug}`} className="group block flex flex-col items-center text-center">
                  <div className="relative overflow-hidden bg-[#FBFBFD] w-full aspect-square rounded-3xl mb-6 flex items-center justify-center p-6 border border-[#EAEAEA]/50 hover:shadow-lg transition-shadow duration-500 ease-out">
                    <img 
                      src={fallbackImages[idx % fallbackImages.length]} 
                      alt={cat.name} 
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                  <h3 className="text-[#111111] font-semibold text-lg tracking-tight mb-2">{cat.name}</h3>
                  <span className="text-[#0066CC] text-sm group-hover:underline">Shop {cat.name}</span>
                </Link>
              );
            })}
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
                <Link key={product.id} to={`/products/${product.slug}`} className="group block bg-white rounded-[24px] p-6 border border-[#EAEAEA]/40 hover:shadow-xl transition-shadow duration-500 flex flex-col items-center text-center">
                  <div className="relative w-full aspect-square mb-6 overflow-hidden flex justify-center items-center">
                    <img 
                      src={product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
                    />
                    
                    {/* Tags */}
                    {product.discount_price && (
                      <div className="absolute top-0 left-0 bg-[#E83422] text-white text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide">
                        Sale
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 justify-end items-center w-full">
                    <span className="text-[12px] font-medium text-[#6B6B6B] mb-2">{product.category_name || 'Parts'}</span>
                    <h3 className="text-lg font-semibold text-[#111111] line-clamp-2 mb-3 leading-snug">{product.name}</h3>

                    <div className="flex items-center gap-2 mt-auto">
                      {product.discount_price ? (
                        <>
                          <span className="text-base font-semibold text-[#111111]">₹{product.discount_price}</span>
                          <span className="text-sm text-[#9CA3AF] line-through">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="text-base font-semibold text-[#111111]">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
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
          <div className="md:w-1/2 min-h-[500px] relative">
            <img 
              src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1000&q=80" 
              alt="Performance Engineering" 
              className="absolute inset-0 w-full h-full object-cover grayscale-[30%] mix-blend-multiply opacity-90"
            />
          </div>
        </RevealOnScroll>
      </section>

    </div>
  );
}
