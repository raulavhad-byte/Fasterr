import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path ? 'text-brand-600' : 'text-gray-500';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/search')}`} onClick={() => window.scrollTo(0,0)}>
        <Search className="w-6 h-6" />
        <span className="text-[10px] font-medium">Search</span>
      </Link>

      <Link to="/sell" className="flex flex-col items-center gap-1 -mt-8">
        <div className="bg-brand-600 text-white p-4 rounded-full shadow-lg border-4 border-gray-50 transform transition-transform active:scale-95">
             <PlusCircle className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-medium text-gray-700">Sell</span>
      </Link>

      <Link to="/favorites" className={`flex flex-col items-center gap-1 ${isActive('/favorites')}`}>
        <Heart className="w-6 h-6" />
        <span className="text-[10px] font-medium">My Ads</span>
      </Link>

      <Link to="/my-listings" className={`flex flex-col items-center gap-1 ${isActive('/my-listings')}`}>
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium">Account</span>
      </Link>
    </div>
  );
};

export default BottomNav;