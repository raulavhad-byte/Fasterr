import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, User } from '../types';
import { getProducts } from '../services/storageService';
import { List, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface MyListingsProps {
    user: User | null;
}

const MyListings: React.FC<MyListingsProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
      if(!user) {
          navigate('/login');
          return;
      }
    const allProducts = getProducts();
    const myProducts = allProducts.filter(p => p.sellerId === user.id);
    setProducts(myProducts);
  }, [user, navigate]);

  const handleEdit = (productId: string) => {
    navigate(`/sell?edit=${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <List className="w-8 h-8 text-brand-600" />
                <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            </div>
             <Link 
                to="/sell" 
                className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none transition-colors"
            >
                <PlusCircle className="w-4 h-4" />
                <span>Post New</span>
            </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={() => handleEdit(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
             <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <List className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">You haven't listed anything yet</h3>
            <p className="mt-1 text-gray-500 mb-6">Start selling your unused items today.</p>
             <Link 
                to="/sell" 
                className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none transition-colors"
            >
                <PlusCircle className="w-4 h-4" />
                <span>Start Selling</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;