import { Activity, ListOrdered, ShoppingBag, Grid, Tag, ChevronRight, Home, LogOut } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, navigate, logout }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'orders', label: 'Orders', icon: ListOrdered },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="card w-[280px] p-6 shrink-0 flex flex-col gap-2">
      <h2 className="text-[18px] mb-6 text-[var(--color-primary)]">Admin Panel</h2>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center justify-between p-4 rounded-[var(--border-radius-md)] cursor-pointer transition-all duration-300 text-left ${isActive ? 'bg-[rgba(204,12,57,0.1)] border border-[var(--border-color)] text-[var(--color-primary)]' : 'bg-transparent border border-transparent text-[var(--color-text-bright)]'}`}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} />
              <span className="font-semibold text-[14px] uppercase tracking-wider">{item.label}</span>
            </div>
            {isActive && <ChevronRight size={16} />}
          </button>
        )
      })}
      
      <div className="mt-auto pt-6 border-t border-[var(--border-color)] flex flex-col gap-3">
        <button 
          className="btn btn-secondary flex items-center gap-2 justify-center" 
          onClick={() => navigate('/')} 
        >
           <Home size={16} /> Go to Storefront
        </button>
        <button 
          className="btn btn-danger flex items-center gap-2 justify-center" 
          onClick={() => { logout(); navigate('/login'); }} 
        >
           <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
