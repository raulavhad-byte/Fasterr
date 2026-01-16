import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { getProducts, getFavorites } from '../services/storageService';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const allProducts = getProducts();
    const favoriteIds = getFavorites();
    const favProducts = allProducts.filter(p => favoriteIds.includes(p.id));
    setProducts(favProducts);
  }, []); // Note: This doesn't auto-update if un-favorited within the page without complex state, but sufficient for simple demo.

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-brand-600 fill-brand-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No favorites yet</h3>
            <p className="mt-1 text-gray-500">Save items you like to view them later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;