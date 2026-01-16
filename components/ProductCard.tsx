import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Heart, Pencil, Eye, Share2 } from 'lucide-react';
import { Product } from '../types';
import { toggleFavorite, isProductFavorite } from '../services/storageService';
import ProductQuickView from './ProductQuickView';

interface ProductCardProps {
  product: Product;
  onEdit?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit }) => {
  const [isFav, setIsFav] = useState(isProductFavorite(product.id));
  const [showQuickView, setShowQuickView] = useState(false);

  const timeAgo = (date: number) => {
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 3600) return 'Just now';
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(product.id);
    setIsFav(newState);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/#/product/${product.id}`);
    alert("Product link copied to clipboard!");
  };

  return (
    <>
      <Link to={`/product/${product.id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200 relative">
          <img
            src={product.image}
            alt={product.title}
            className={`h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${product.status === 'sold' ? 'grayscale opacity-80' : ''}`}
          />
          
          {/* Sold Indicator */}
          {product.status === 'sold' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
                  <span className="bg-red-600 text-white px-6 py-1.5 font-bold text-lg rotate-[-12deg] shadow-lg border-2 border-white uppercase tracking-wider">SOLD</span>
              </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
             {onEdit && (
                <button 
                  onClick={handleEditClick}
                  className="p-2 rounded-full shadow-sm transition-colors bg-white/90 text-gray-700 hover:bg-brand-600 hover:text-white"
                  title="Edit Listing"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button 
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full shadow-sm transition-colors ${isFav ? 'bg-white text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'}`}
                  title="Favorite"
              >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              </button>
              <button 
                  onClick={handleShare}
                  className="p-2 rounded-full shadow-sm transition-colors bg-white/90 text-gray-500 hover:bg-brand-600 hover:text-white"
                  title="Share"
              >
                  <Share2 className="w-4 h-4" />
              </button>
               <button 
                  onClick={handleQuickView}
                  className="p-2 rounded-full shadow-sm transition-colors bg-white/90 text-gray-500 hover:bg-brand-600 hover:text-white"
                  title="Quick View"
              >
                  <Eye className="w-4 h-4" />
              </button>
          </div>

          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
               <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {product.category}
              </span>
               <span className="bg-brand-600/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {product.condition}
              </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{product.title}</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">₹{product.price.toLocaleString('en-IN')}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 border-t border-gray-50 pt-3">
            <div className="flex items-center gap-2">
                 <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(product.sellerName)}&background=random`} 
                    alt={product.sellerName}
                    className="w-5 h-5 rounded-full"
                 />
                 <span className="truncate max-w-[80px] font-medium text-gray-700">{product.sellerName}</span>
            </div>
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[60px]">{product.location.split(',')[0]}</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(product.createdAt)}</span>
                 </div>
            </div>
          </div>
        </div>
      </Link>
      
      <ProductQuickView 
        product={product} 
        isOpen={showQuickView} 
        onClose={() => setShowQuickView(false)} 
        isFav={isFav}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
      />
    </>
  );
};

export default ProductCard;