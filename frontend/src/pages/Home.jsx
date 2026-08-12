import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, PhoneCall, Smartphone, ArrowRight, ChevronRight, Menu } from 'lucide-react';
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
    <div className="bg-[#f4f5f7] min-h-screen pt-[120px] pb-10">
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="bg-white border border-gray-200 shadow-sm mb-6">
            <div className="bg-[#222222] text-white p-4 flex items-center gap-2 font-bold uppercase">
              <Menu size={20} /> Shop Categories
            </div>
            <ul className="flex flex-col">
              {categories.slice(0, 10).map((cat, idx) => (
                <li key={cat.id} className="border-b border-gray-100 last:border-0">
                  <Link to={`/products?category=${cat.slug}`} className="flex items-center justify-between p-3.5 text-gray-600 hover:text-[#ff3333] hover:bg-gray-50 transition-colors text-sm font-medium">
                    {cat.name} <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Promo Side Banner */}
          <div className="bg-[#ff3333] text-white p-6 text-center border border-[#e60000] mb-6">
            <h4 className="font-medium text-sm mb-2 uppercase tracking-wide">Explore Our Limited</h4>
            <h3 className="font-bold text-2xl uppercase mb-3">Weekend Deal</h3>
            <div className="w-10 h-0.5 bg-white mx-auto mb-3"></div>
            <p className="text-sm mb-4">Hurry Up before Offer Will end</p>
            <div className="flex justify-center gap-2 mb-4">
              <div className="bg-[#cc0000] p-2 rounded w-12"><div className="font-bold">000</div><div className="text-[10px]">days</div></div>
              <div className="bg-[#cc0000] p-2 rounded w-12"><div className="font-bold">5</div><div className="text-[10px]">hrs</div></div>
              <div className="bg-[#cc0000] p-2 rounded w-12"><div className="font-bold">24</div><div className="text-[10px]">min</div></div>
            </div>
            <Link to="/products" className="text-sm underline font-bold hover:text-gray-200">View All Details</Link>
          </div>

          {/* Testimonial */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="bg-[#ff3333] text-white p-3 font-bold uppercase">Testimonial</div>
            <div className="p-5 text-center">
              <img src="https://i.pravatar.cc/100?img=11" alt="John Duff" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-gray-100" />
              <h4 className="font-bold text-gray-800">John Duff</h4>
              <p className="text-xs text-gray-400 mb-3">Producer</p>
              <p className="text-sm text-gray-500 italic">"Excellent quality auto parts. Delivery was fast and the products were exactly as described."</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Main Hero Banner */}
          <div className="bg-[#111] text-white rounded overflow-hidden relative h-[350px] md:h-[400px] mb-6 flex items-center">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-40" alt="Cars" />
            </div>
            <div className="relative z-10 p-10 md:p-16 max-w-lg">
              <div className="text-[#ff3333] font-bold text-sm tracking-widest uppercase mb-2">New Generation</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Covers Deflectors<br/>Car Mats</h1>
              <Link to="/products" className="inline-block bg-[#ff3333] hover:bg-[#e60000] text-white px-6 py-3 font-bold uppercase text-sm transition-colors rounded">
                Shop Now
              </Link>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 flex items-center gap-4 border border-gray-200 rounded">
              <Truck size={32} className="text-[#ff3333]" />
              <div><h4 className="font-bold text-sm text-gray-800">Easy to buy & return</h4><p className="text-[11px] text-gray-500">Single click to buy & return</p></div>
            </div>
            <div className="bg-white p-4 flex items-center gap-4 border border-gray-200 rounded">
              <ShieldCheck size={32} className="text-[#ff3333]" />
              <div><h4 className="font-bold text-sm text-gray-800">Secure Payments</h4><p className="text-[11px] text-gray-500">100% payment security</p></div>
            </div>
            <div className="bg-white p-4 flex items-center gap-4 border border-gray-200 rounded">
              <PhoneCall size={32} className="text-[#ff3333]" />
              <div><h4 className="font-bold text-sm text-gray-800">24x7 Support Available</h4><p className="text-[11px] text-gray-500">Support 24 hours a day</p></div>
            </div>
            <div className="bg-white p-4 flex items-center gap-4 border border-gray-200 rounded">
              <Smartphone size={32} className="text-[#ff3333]" />
              <div><h4 className="font-bold text-sm text-gray-800">Shop with our App</h4><p className="text-[11px] text-gray-500">Download app & get offers</p></div>
            </div>
          </div>

          {/* Sub Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {categories.slice(0, 3).map(cat => (
              <div key={cat.id} className="bg-white border border-gray-200 p-6 flex items-center gap-4 rounded">
                <div className="w-20 h-20 shrink-0 bg-gray-50 rounded p-2">
                  {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover mix-blend-multiply" /> : <div className="w-full h-full bg-gray-200"></div>}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">{cat.name}</h4>
                  <ul className="text-xs text-gray-500 space-y-1 mb-2">
                    <li>Body Shell</li>
                    <li>Bonnet Grill</li>
                  </ul>
                  <Link to={`/products?category=${cat.slug}`} className="text-xs font-bold text-gray-800 uppercase hover:text-[#ff3333]">View All</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Trending Products */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-800 m-0">Trending Products</h2>
              <div className="flex gap-2">
                <button className="bg-[#ff3333] text-white px-4 py-1.5 text-sm font-bold rounded-sm">New Products</button>
                <button className="bg-gray-200 text-gray-700 px-4 py-1.5 text-sm font-bold rounded-sm hover:bg-gray-300">Best Selling</button>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading products...</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 8).map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 p-4 relative group rounded hover:shadow-lg transition-shadow">
                    {product.discount_price && <span className="absolute top-2 right-2 bg-[#ff3333] text-white text-[10px] font-bold px-2 py-0.5 rounded">SALE</span>}
                    <Link to={`/products/${product.slug}`} className="block h-40 flex items-center justify-center mb-4">
                      <img src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=200'} alt={product.name} className="max-w-full max-h-full object-contain" />
                    </Link>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-[#f59e0b] text-[#f59e0b]" />)}
                    </div>
                    <Link to={`/products/${product.slug}`} className="text-sm font-medium text-gray-600 line-clamp-1 mb-2 hover:text-[#ff3333]">{product.name}</Link>
                    <div className="flex items-center gap-2 mb-3">
                      {product.discount_price ? (
                        <>
                          <span className="font-bold text-gray-900 text-lg">₹{product.discount_price}</span>
                          <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="font-bold text-gray-900 text-lg">₹{product.price}</span>
                      )}
                    </div>
                    <button className="w-full bg-[#333] hover:bg-[#ff3333] text-white py-2 text-xs font-bold uppercase transition-colors rounded flex items-center justify-center gap-2" onClick={() => handleBuyNow(product.id)}>
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promo Banners Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#f8f9fa] border border-gray-200 p-8 rounded flex items-center justify-between relative overflow-hidden h-[200px]">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Flat 15% Off</h3>
                <p className="text-xs text-gray-500 mb-4">Tyre inflators, Car tyres, Pressure Washer...</p>
                <Link to="/products" className="bg-[#ff3333] text-white px-5 py-2 text-xs font-bold uppercase rounded inline-block">Shop Now</Link>
              </div>
              <img src="https://images.unsplash.com/photo-1600705722908-bab1e6191b1a?auto=format&fit=crop&w=300" className="absolute right-[-20px] bottom-[-20px] h-full object-contain mix-blend-multiply opacity-80" alt="Promo" />
            </div>
            <div className="bg-[#f8f9fa] border border-gray-200 p-8 rounded flex items-center justify-between relative overflow-hidden h-[200px]">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Oldest Autoparts</h3>
                <p className="text-xs text-gray-500 mb-4">10 Autoparts You Need For Car</p>
                <Link to="/products" className="bg-[#333] text-white px-5 py-2 text-xs font-bold uppercase rounded inline-block">Shop Now</Link>
              </div>
              <img src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=300" className="absolute right-[-20px] bottom-[-20px] h-full object-contain mix-blend-multiply opacity-80" alt="Promo" />
            </div>
          </div>

          {/* Special Products */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-gray-800 m-0">Special Products</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {deals.slice(0, 4).map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 p-4 relative group rounded hover:shadow-lg transition-shadow">
                    <span className="absolute top-2 right-2 text-[#ff3333] text-[10px] font-bold">HOT</span>
                    <Link to={`/products/${product.slug}`} className="block h-40 flex items-center justify-center mb-4">
                      <img src={product.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=200'} alt={product.name} className="max-w-full max-h-full object-contain" />
                    </Link>
                    <div className="flex justify-center gap-2 text-[10px] font-bold text-gray-500 mb-3 bg-gray-50 py-1 rounded">
                      <span className="flex items-center gap-1"><span className="text-gray-800">204</span>Days</span>
                      <span className="flex items-center gap-1"><span className="text-gray-800">13</span>Hrs</span>
                      <span className="flex items-center gap-1"><span className="text-gray-800">46</span>Min</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-[#f59e0b] text-[#f59e0b]" />)}
                    </div>
                    <Link to={`/products/${product.slug}`} className="text-sm font-medium text-gray-600 line-clamp-1 mb-2 hover:text-[#ff3333]">{product.name}</Link>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-gray-900 text-lg">₹{product.price}</span>
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
