import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, User } from '../types';
import { getProducts, getFavorites } from '../services/storageService';
import { List, PlusCircle, Heart, Settings, HelpCircle, Package, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface MyListingsProps {
    user: User | null;
}

const MyListings: React.FC<MyListingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites'>('listings');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favProducts, setFavProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
      if(!user) {
          navigate('/login');
          return;
      }
    const allProducts = getProducts();
    setMyProducts(allProducts.filter(p => p.sellerId === user.id));
    
    const favoriteIds = getFavorites();
    setFavProducts(allProducts.filter(p => favoriteIds.includes(p.id)));

  }, [user, navigate]);

  const handleEdit = (productId: string) => {
    navigate(`/sell?edit=${productId}`);
  };

  const activeProducts = myProducts.filter(p => p.status === 'active');
  const soldProducts = myProducts.filter(p => p.status === 'sold');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-12">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative">
                      <img 
                        src={user?.avatar} 
                        alt="Profile" 
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-gray-200" 
                      />
                      <button className="absolute bottom-0 right-0 bg-brand-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                          <Settings className="w-4 h-4" />
                      </button>
                  </div>
                  <div className="text-center md:text-left flex-1">
                      <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                      <p className="text-gray-500">{user?.email}</p>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="text-lg font-bold text-brand-600">{myProducts.length}</p>
                              <p className="text-xs text-gray-500 uppercase font-medium">Listings</p>
                          </div>
                          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="text-lg font-bold text-brand-600">{soldProducts.length}</p>
                              <p className="text-xs text-gray-500 uppercase font-medium">Sold</p>
                          </div>
                          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="text-lg font-bold text-brand-600">{favProducts.length}</p>
                              <p className="text-xs text-gray-500 uppercase font-medium">Favorites</p>
                          </div>
                      </div>
                  </div>
                   <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Link 
                            to="/sell" 
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg shadow hover:bg-brand-700 transition-colors"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Post New Ad
                        </Link>
                         <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                            <Settings className="w-5 h-5" />
                            Edit Profile
                        </button>
                   </div>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 justify-center md:justify-start">
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`${activeTab === 'listings' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                      <Package className="w-4 h-4" />
                      My Ads
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`${activeTab === 'favorites' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                      <Heart className="w-4 h-4" />
                      Favorites
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
                       <HelpCircle className="w-4 h-4" />
                       Help & Support
                  </button>
              </nav>
          </div>

          <div className="mt-6">
              {activeTab === 'listings' && (
                  <div>
                    {myProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {myProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onEdit={() => handleEdit(product.id)}
                            />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
                            <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Package className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">You haven't listed anything yet</h3>
                            <p className="mt-1 text-gray-500 mb-6 max-w-sm mx-auto">Turn your unused items into cash. It's free and takes less than a minute.</p>
                            <Link 
                                to="/sell" 
                                className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-bold rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Start Selling
                            </Link>
                        </div>
                    )}
                  </div>
              )}

              {activeTab === 'favorites' && (
                   <div>
                   {favProducts.length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                           {favProducts.map(product => (
                           <ProductCard key={product.id} product={product} />
                           ))}
                       </div>
                   ) : (
                       <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
                           <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                               <Heart className="w-8 h-8" />
                           </div>
                           <h3 className="text-lg font-medium text-gray-900">No favorites yet</h3>
                           <p className="mt-1 text-gray-500 mb-6">Save items you like to view them later.</p>
                           <Link to="/" className="text-brand-600 font-bold hover:underline">Browse Products</Link>
                       </div>
                   )}
                 </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default MyListings;