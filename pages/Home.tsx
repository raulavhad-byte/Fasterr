import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, Category, Condition } from '../types';
import { getProducts } from '../services/storageService';
import { Tag, Filter, X, ArrowUpDown, Sparkles, MapPin, Smartphone, ChevronDown } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
  locationFilter: string;
  smartFilters: any;
}

type SortOption = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc';

const Home: React.FC<HomeProps> = ({ searchQuery, locationFilter, smartFilters }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  
  // Filters
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<Condition | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const allProducts = getProducts();
    setProducts(allProducts);
  }, []);

  useEffect(() => {
    if (smartFilters) {
        if (smartFilters.category) setSelectedCategory(smartFilters.category as Category);
        if (smartFilters.minPrice) setMinPrice(smartFilters.minPrice.toString());
        if (smartFilters.maxPrice) setMaxPrice(smartFilters.maxPrice.toString());
        if (smartFilters.sortBy) setSortOption(smartFilters.sortBy);
    }
  }, [smartFilters]);

  const categories = ['All', ...Object.values(Category)];
  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    const price = product.price;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;

    const matchesCondition = selectedCondition === 'All' || product.condition === selectedCondition;
    const matchesLocation = !locationFilter || product.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesPrice && matchesCondition && matchesLocation;
  }).sort((a, b) => {
      switch (sortOption) {
          case 'price_asc':
              return a.price - b.price;
          case 'price_desc':
              return b.price - a.price;
          case 'date_asc':
              return a.createdAt - b.createdAt;
          case 'date_desc':
          default:
              return b.createdAt - a.createdAt;
      }
  });

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedCondition('All');
    setSortOption('date_desc');
    setSelectedCategory('All');
  };

  const hasActiveFilters = minPrice || maxPrice || selectedCondition !== 'All' || selectedCategory !== 'All';

  const FilterPanel = () => (
      <div className="space-y-6">
        <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                Categories
                {selectedCategory !== 'All' && <button onClick={() => setSelectedCategory('All')} className="text-xs text-brand-600">Reset</button>}
            </h3>
            <ul className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map(cat => (
                    <li key={cat}>
                        <button 
                            onClick={() => setSelectedCategory(cat as Category | 'All')}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === cat ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {cat}
                        </button>
                    </li>
                ))}
            </ul>
        </div>

        <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-gray-900 mb-3">Price Range</h3>
             <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    placeholder="Min ₹" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 bg-gray-50"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="number" 
                    placeholder="Max ₹" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 bg-gray-50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />
            </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
             <h3 className="font-bold text-gray-900 mb-3">Condition</h3>
             <div className="space-y-1">
                 {conditions.filter(c => c !== 'All').map(c => (
                     <label key={c} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                         <input 
                            type="radio" 
                            name="condition"
                            checked={selectedCondition === c}
                            onChange={() => setSelectedCondition(c as Condition)}
                            className="text-brand-600 focus:ring-brand-500" 
                         />
                         {c}
                     </label>
                 ))}
                 <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                     <input 
                        type="radio" 
                        name="condition"
                        checked={selectedCondition === 'All'}
                        onChange={() => setSelectedCondition('All')}
                        className="text-brand-600 focus:ring-brand-500" 
                     />
                     Any Condition
                 </label>
             </div>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* App Download Banner - Visible mainly on desktop */}
      {!searchQuery && (
          <div className="bg-white border-b border-gray-200 hidden md:block">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-8">
                  <div className="flex-1">
                      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">TRY THE FASTERR APP</h2>
                      <p className="text-gray-600 mb-4">Buy, sell and find just about anything using the app on your mobile.</p>
                      <div className="flex gap-3">
                           <div className="bg-black text-white rounded px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:opacity-90">
                               <Smartphone className="w-5 h-5" />
                               <div>
                                   <p className="text-[10px] uppercase">Get it on</p>
                                   <p className="text-sm font-bold leading-none">Google Play</p>
                               </div>
                           </div>
                           <div className="bg-black text-white rounded px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:opacity-90">
                               <div className="text-xl"></div>
                               <div>
                                   <p className="text-[10px] uppercase">Download on the</p>
                                   <p className="text-sm font-bold leading-none">App Store</p>
                               </div>
                           </div>
                      </div>
                  </div>
                  <div className="w-px h-24 bg-gray-200"></div>
                  <div className="text-center px-4">
                      <p className="font-bold text-gray-400 text-xs mb-2">GET YOUR APP TODAY</p>
                       <div className="w-16 h-16 bg-gray-800 mx-auto flex items-center justify-center text-white text-[8px]">QR Code</div>
                  </div>
              </div>
          </div>
      )}

      {/* Hero / Promo - only show if no location filter */}
      {!searchQuery && !locationFilter && (
        <div className="bg-white border-b border-gray-200 py-6 mb-4 md:mb-6">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex items-center gap-2 text-brand-700 mb-1">
                 <Sparkles className="w-4 h-4" />
                 <span className="font-bold uppercase tracking-wide text-xs">Fresh Recommendations</span>
             </div>
             <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Discover treasures near you.
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
            <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium shadow-sm text-gray-700"
            >
                <Filter className="w-4 h-4" />
                Filters {hasActiveFilters && <span className="bg-brand-600 w-2 h-2 rounded-full"></span>}
            </button>
            <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-500">Sort:</span>
                 <select
                    className="bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                >
                    <option value="date_desc">Newest</option>
                    <option value="price_asc">Price: Low</option>
                    <option value="price_desc">Price: High</option>
                </select>
            </div>
        </div>

        {/* Mobile Filter Sheet */}
        {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <FilterPanel />
                </div>
                <div className="p-4 border-t border-gray-200 flex gap-4">
                    <button onClick={clearFilters} className="flex-1 py-3 text-brand-600 font-medium border border-brand-600 rounded-lg">Clear All</button>
                    <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-3 bg-brand-600 text-white font-medium rounded-lg">Apply</button>
                </div>
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white p-5 rounded-xl border border-gray-200 sticky top-24">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filters
                        </h2>
                        {hasActiveFilters && (
                             <button onClick={clearFilters} className="text-xs text-red-600 hover:underline">Clear All</button>
                        )}
                     </div>
                     <FilterPanel />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Results Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {searchQuery ? `Results for "${searchQuery}"` : 'Fresh Recommendations'}
                        </h2>
                        {locationFilter && (
                            <div className="flex items-center gap-1 text-brand-600 text-xs font-medium mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{locationFilter}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Desktop Sort */}
                    <div className="hidden lg:flex items-center gap-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <div className="relative">
                             <select
                                className="appearance-none bg-white border border-gray-300 text-gray-900 py-1.5 px-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as SortOption)}
                            >
                                <option value="date_desc">Newest First</option>
                                <option value="date_asc">Oldest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                    <Tag className="w-full h-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No items found</h3>
                    <p className="mt-1 text-gray-500 text-sm">
                        {locationFilter 
                            ? `No items found in "${locationFilter}". Try a different location.` 
                            : "Try adjusting your search or filters."}
                    </p>
                    {hasActiveFilters && (
                        <button 
                            onClick={clearFilters}
                            className="mt-4 text-brand-600 hover:text-brand-700 font-medium text-sm"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;