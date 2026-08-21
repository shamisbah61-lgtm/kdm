import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ArrowRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';

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
      <section className="w-full px-6 md:px-10 py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto relative rounded-lg overflow-hidden h-[65vh] md:h-[75vh] flex items-center bg-[#F8F8F8]">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1440&q=80" 
            alt="Editorial Campaign" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="relative z-10 p-8 md:p-16 lg:p-24 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Precision Engineering for the Track
            </h1>
            <p className="text-base md:text-lg text-white/90 font-medium mb-10 max-w-md">
              Discover our latest collection of premium KDM aftermarket parts. Engineered with uncompromising attention to performance and quality.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#111111] font-medium text-sm transition-all hover:bg-[#F8F8F8] min-w-[180px]"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full px-6 md:px-10 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
            <Link to="/categories" className="text-sm font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 4).map((cat, idx) => {
              const fallbackImages = [
                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
                "https://images.unsplash.com/photo-1599818815777-62f7e7f1eab6?auto=format&fit=crop&q=80&w=600",
                "https://images.unsplash.com/photo-1621215418197-0fc5451eb9dc?auto=format&fit=crop&q=80&w=600",
                "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=600"
              ];
              return (
                <Link key={cat.id} to={`/products?category=${cat.slug}`} className="group block relative overflow-hidden bg-[#F8F8F8] aspect-[4/5]">
                  <img 
                    src={fallbackImages[idx % fallbackImages.length]} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white font-medium text-lg tracking-wide">{cat.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full px-6 md:px-10 py-16 lg:py-24 bg-[#F8F8F8]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">New Arrivals</h2>
            <p className="text-[#6B6B6B] max-w-2xl">The latest additions to our collection. Thoughtfully designed and carefully crafted.</p>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#111111] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {featuredProducts.slice(0, 8).map(product => (
                <Link key={product.id} to={`/products/${product.slug}`} className="group block">
                  <div className="relative bg-white aspect-[3/4] mb-4 overflow-hidden">
                    <img 
                      src={product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
                      alt={product.name} 
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
                    />
                    
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.discount_price && (
                        <span className="bg-[#111111] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Sale</span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:text-red-500 shadow-sm" onClick={(e) => { e.preventDefault(); }}>
                      <Heart size={14} strokeWidth={2} />
                    </button>

                    {/* Quick Add Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button 
                        onClick={(e) => handleQuickAdd(e, product.id)}
                        className="w-full bg-white/95 backdrop-blur-sm text-[#111111] py-3 text-sm font-medium border border-[#EAEAEA] hover:bg-[#111111] hover:text-white transition-colors shadow-sm"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-[#6B6B6B] mb-1">{product.category_name || 'Parts'}</span>
                    <h3 className="text-sm font-medium text-[#111111] truncate mb-2">{product.name}</h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-[#111111]">
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < 4 ? 'fill-current' : 'fill-transparent stroke-[#D1D5DB]'} />)}
                      </div>
                      <span className="text-[10px] text-[#6B6B6B]">(12)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {product.discount_price ? (
                        <>
                          <span className="text-sm font-medium text-[#EF4444]">₹{product.discount_price}</span>
                          <span className="text-xs text-[#9CA3AF] line-through">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[#111111]">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-16 flex justify-center">
            <Link to="/products" className="inline-flex items-center justify-center px-8 py-3 border border-[#111111] text-[#111111] text-sm font-medium hover:bg-[#111111] hover:text-white transition-colors min-w-[160px]">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Split Section */}
      <section className="w-full px-6 md:px-10 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-stretch gap-0 border border-[#EAEAEA]">
          <div className="md:w-1/2 p-10 md:p-16 lg:p-24 flex flex-col justify-center bg-white">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B6B6B] mb-4">Our Philosophy</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Elevating Performance.</h2>
            <p className="text-[#6B6B6B] text-base leading-relaxed mb-8">
              We believe in creating parts that withstand the ultimate test of the track. By combining precision engineering with aggressive styling, we deliver aftermarket solutions that dominate the competition.
            </p>
            <Link to="/about" className="inline-flex items-center text-sm font-medium border-b border-[#111111] pb-1 w-max hover:text-[#6B6B6B] hover:border-[#6B6B6B] transition-colors">
              Discover Our Story
            </Link>
          </div>
          <div className="md:w-1/2 min-h-[400px] bg-[#F8F8F8]">
            <img 
              src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80" 
              alt="Performance Engineering" 
              className="w-full h-full object-cover grayscale-[20%]"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
