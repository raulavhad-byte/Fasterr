import React from 'react';
import { X, MapPin, Clock, Heart, Share2 } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  isFav: boolean;
  onShare: (e: React.MouseEvent) => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose, onToggleFavorite, isFav, onShare }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col md:flex-row">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white z-20 text-gray-500 hover:text-gray-900"
        >
            <X className="w-5 h-5" />
        </button>
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 min-h-[300px] md:min-h-full">
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
                     <p className="text-3xl font-black text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={onToggleFavorite} className={`p-2 rounded-full border ${isFav ? 'bg-red-50 border-red-100 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-500'}`}>
                         <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                     </button>
                     <button onClick={onShare} className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-brand-600">
                         <Share2 className="w-5 h-5" />
                     </button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">{product.category}</span>
                <span className="bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded font-medium">{product.condition}</span>
                {product.status === 'sold' && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold">SOLD</span>}
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6 flex-1">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span>{product.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-500" />
                    <span>Posted {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-4 text-gray-700 line-clamp-4 leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-auto">
                 <div className="flex items-center gap-3 mb-4">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(product.sellerName)}&background=random`} alt={product.sellerName} className="w-10 h-10 rounded-full" />
                      <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.sellerName}</p>
                          <p className="text-xs text-gray-500">Seller</p>
                      </div>
                 </div>
                 <Link 
                    to={`/product/${product.id}`}
                    className="block w-full text-center bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition-colors"
                 >
                     View Full Details
                 </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;