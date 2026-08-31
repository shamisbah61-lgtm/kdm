import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="bg-white min-h-screen text-[#111111] animate-fade-in pb-32">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-20 lg:pt-32">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-[#111111] leading-[1.1] mb-8">
            Driven by perfection.
          </h1>
          <p className="text-xl md:text-2xl text-[#6B6B6B] font-normal leading-relaxed max-w-3xl mx-auto">
            KDM Automotive was founded on a simple principle: to engineer and deliver the most premium aftermarket parts in the world. We don't just sell components; we redefine performance.
          </p>
        </div>

        {/* Big Image Section */}
        <div className="relative w-full h-[50vh] md:h-[70vh] rounded-[32px] overflow-hidden mb-32 bg-[#FBFBFD] flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1600" 
            alt="KDM Engineering" 
            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 max-w-5xl mx-auto">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">Uncompromising Quality.</h2>
            <p className="text-lg text-[#6B6B6B] leading-relaxed">
              Every single product that leaves our facility undergoes rigorous testing. We believe that true performance requires absolute precision. Our materials are sourced from the finest manufacturers globally, ensuring that your vehicle receives nothing but the best.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">Designed for the purist.</h2>
            <p className="text-lg text-[#6B6B6B] leading-relaxed mb-8">
              We design with minimalism and functionality in mind. By stripping away the unnecessary, we focus entirely on what matters: the pure driving experience.
            </p>
            <Link to="/products" className="inline-flex items-center justify-center bg-[#111111] hover:bg-[#333333] text-white px-8 py-3 rounded-full text-[15px] font-medium transition-all active:scale-95 self-start">
              Explore the Collection
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
