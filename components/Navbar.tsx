import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, LogIn, LogOut, Heart, List, TrendingUp, ChevronDown, MapPin, Crosshair, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, Product, Category } from '../types';
import { logoutUser, getProducts } from '../services/storageService';
import { parseSearchQuery } from '../services/geminiService';

interface NavbarProps {
  user: User | null;
  setUser: (user: User | null) => void;
  onSearch: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  onSmartFilters: (filters: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser, onSearch, selectedLocation, setSelectedLocation, onSmartFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllProducts(getProducts());

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
      if (locRef.current && !locRef.current.contains(event.target as Node)) {
        setShowLocationPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onSearch(val);

    if (val.trim().length > 0) {
      const lowerVal = val.toLowerCase();
      const matchedTitles = allProducts.filter(p => p.title.toLowerCase().includes(lowerVal)).map(p => p.title);
      const matchedCategories = allProducts.filter(p => p.category.toLowerCase().includes(lowerVal)).map(p => p.category);
      const uniqueSuggestions = Array.from(new Set([...matchedCategories, ...matchedTitles]));
      
      const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(lowerVal);
        const bStarts = b.toLowerCase().startsWith(lowerVal);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      }).slice(0, 8);

      setSuggestions(sortedSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    navigate('/');
  };

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsAiThinking(true);
    try {
        const filters = await parseSearchQuery(searchTerm);
        if (filters) {
            if (filters.location) setSelectedLocation(filters.location);
            onSmartFilters(filters);
            navigate('/');
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsAiThinking(false);
        setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          setShowSuggestions(false);
          navigate('/');
      }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate('/');
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Location handling
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
           const mockCurrentLocation = "New York, NY"; 
           setSelectedLocation(mockCurrentLocation);
           setShowLocationPopup(false);
        },
        (error) => {
          alert("Could not detect location. Please select manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const popularLocations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL'];

  const categoryGroups = [
    { name: 'Mobiles', icon: '📱', subs: ['Mobile Phones', 'Accessories', 'Tablets'] },
    { name: 'Vehicles', icon: '🚗', subs: ['Cars', 'Commercial Vehicles', 'Spare Parts'] },
    { name: 'Properties', icon: '🏠', subs: ['For Sale: Houses', 'For Rent: Houses', 'Lands & Plots'] },
    { name: 'Electronics', icon: '💻', subs: ['Computers', 'TV, Video, Audio', 'Cameras'] },
    { name: 'Furniture', icon: '🪑', subs: ['Sofa & Dining', 'Beds', 'Home Decor'] },
    { name: 'Fashion', icon: '👕', subs: ['Men', 'Women', 'Kids'] },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Header */}
      <div className="bg-gray-100/50 border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 gap-4">
              
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex flex-col items-start justify-center group">
                <span className="text-3xl font-black text-brand-800 tracking-tighter leading-none group-hover:text-brand-700 transition-colors">FASTERR</span>
                <span className="text-[10px] font-bold text-brand-600 tracking-widest uppercase -mt-1">Buy & Sell it. Easily.</span>
              </Link>

              {/* Location Selector */}
              <div className="hidden md:block relative min-w-[200px]" ref={locRef}>
                  <button 
                    onClick={() => setShowLocationPopup(!showLocationPopup)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 border-2 border-brand-800 rounded hover:border-brand-600 transition-colors bg-white text-brand-900 font-bold text-sm"
                  >
                      <MapPin className="w-5 h-5 text-brand-800" />
                      <span className="truncate flex-1 text-left">{selectedLocation || 'India'}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showLocationPopup ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Location Popup (Same as before) */}
                  {showLocationPopup && (
                      <div className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-md shadow-xl border border-gray-200 p-4 z-50">
                          <button 
                            onClick={handleUseCurrentLocation}
                            className="flex items-center gap-3 w-full text-left text-blue-600 font-bold p-2 hover:bg-blue-50 rounded transition-colors mb-2"
                          >
                              <Crosshair className="w-5 h-5" />
                              <span>Use Current Location</span>
                          </button>
                          <div className="border-t border-gray-200 pt-3">
                              <p className="text-xs text-gray-400 uppercase font-medium mb-3">Popular Locations</p>
                              <ul className="space-y-1">
                                  {popularLocations.map(loc => (
                                      <li key={loc}>
                                          <button 
                                            onClick={() => { setSelectedLocation(loc); setShowLocationPopup(false); }}
                                            className="w-full text-left px-2 py-2 text-gray-700 hover:text-brand-800 hover:bg-gray-50 rounded text-sm"
                                          >
                                              {loc}
                                          </button>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  )}
              </div>

              {/* Search Bar - Redesigned */}
              <div className="flex-1 max-w-2xl relative" ref={searchRef}>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    className="block w-full pl-4 pr-12 py-2.5 border-2 border-brand-800 rounded-l rounded-r-none leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-brand-600 sm:text-lg transition duration-150 ease-in-out h-12"
                    placeholder="Search 'Cars'..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (searchTerm.trim().length > 0) setShowSuggestions(true); }}
                  />
                  <button 
                    onClick={handleAiSearch}
                    className="h-12 w-14 bg-brand-50 border-y-2 border-r-2 border-brand-800 rounded-r flex items-center justify-center hover:bg-brand-100 transition-colors"
                    title="AI Smart Search"
                  >
                     {isAiThinking ? <Sparkles className="w-6 h-6 text-brand-800 animate-spin" /> : <Sparkles className="w-6 h-6 text-brand-800" />}
                  </button>
                </div>

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 flex items-center gap-3 transition-colors"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                <span dangerouslySetInnerHTML={{
                                    __html: suggestion.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="font-bold text-gray-900">$1</span>')
                                }} />
                            </button>
                        ))}
                    </div>
                )}
              </div>

              {/* Right Actions */}
              <div className="hidden md:flex items-center gap-4">
                 {user ? (
                   <>
                      <div className="flex items-center gap-3 cursor-pointer group relative">
                        <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full bg-gray-200 border border-gray-300" />
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50">
                            <Link to="/my-listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Ads</Link>
                            <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Favorites</Link>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-red-600">Logout</button>
                        </div>
                      </div>
                      <Link to="/sell" className="flex items-center gap-2 px-6 py-2 rounded-full shadow-lg text-brand-800 bg-white border-4 border-t-brand-300 border-l-brand-300 border-r-brand-600 border-b-brand-600 font-bold hover:shadow-xl transition-all transform hover:scale-105 uppercase tracking-wide">
                        <PlusCircle className="w-5 h-5" />
                        <span>SELL</span>
                      </Link>
                   </>
                 ) : (
                   <div className="flex items-center gap-4">
                     <Link to="/login" className="font-bold text-brand-800 hover:underline text-lg">Login</Link>
                     <Link to="/login" className="flex items-center gap-2 px-6 py-2 rounded-full shadow-lg text-brand-800 bg-white border-4 border-t-brand-300 border-l-brand-300 border-r-brand-600 border-b-brand-600 font-bold hover:shadow-xl transition-all transform hover:scale-105 uppercase tracking-wide">
                        <PlusCircle className="w-5 h-5" />
                        <span>SELL</span>
                      </Link>
                   </div>
                 )}
              </div>
            </div>
          </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm relative z-40" ref={catRef}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center h-12">
                  {/* All Categories Trigger */}
                  <button 
                    className="flex items-center gap-2 font-bold text-brand-900 hover:text-brand-700 uppercase text-sm tracking-wide mr-6 flex-shrink-0"
                    onClick={() => setShowCategories(!showCategories)}
                  >
                      <span>ALL CATEGORIES</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Horizontal Scrollable List */}
                  <div className="flex-1 relative flex items-center overflow-hidden h-full">
                      {/* Left Scroll Arrow */}
                      <button 
                        onClick={() => scrollCategories('left')}
                        className="hidden md:flex absolute left-0 z-10 h-full items-center pr-4 bg-gradient-to-r from-white via-white to-transparent text-gray-500 hover:text-brand-800"
                      >
                         <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Scroll Container */}
                      <div 
                        className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth px-8 w-full h-full"
                        ref={categoryScrollRef}
                      >
                          {Object.values(Category).map(cat => (
                              <button 
                                key={cat} 
                                onClick={() => onSearch(cat)} 
                                className="whitespace-nowrap hover:text-brand-600 transition-colors text-sm text-gray-600 hover:font-medium"
                              >
                                  {cat}
                              </button>
                          ))}
                      </div>

                       {/* Right Scroll Arrow */}
                       <button 
                        onClick={() => scrollCategories('right')}
                        className="hidden md:flex absolute right-0 z-10 h-full items-center pl-4 bg-gradient-to-l from-white via-white to-transparent text-gray-500 hover:text-brand-800"
                      >
                         <ChevronRight className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
          
          {/* Mega Menu Dropdown */}
          {showCategories && (
              <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 z-50 py-8 animate-in slide-in-from-top-1 fade-in duration-200">
                  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
                      {categoryGroups.map((group) => (
                          <div key={group.name}>
                              <h3 className="font-bold text-brand-900 mb-3 flex items-center gap-2 text-base">
                                  <span>{group.icon}</span> {group.name}
                              </h3>
                              <ul className="space-y-2">
                                  {group.subs.map(sub => (
                                      <li key={sub}>
                                          <button 
                                            onClick={() => { onSearch(sub); setShowCategories(false); }}
                                            className="text-sm text-gray-500 hover:text-brand-700 hover:font-semibold transition-all"
                                          >
                                              {sub}
                                          </button>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                       <div>
                            <h3 className="font-bold text-brand-900 mb-3 flex items-center gap-2 text-base">More Categories</h3>
                            <ul className="space-y-2">
                                {Object.values(Category).slice(6).map(cat => (
                                     <li key={cat}>
                                        <button 
                                          onClick={() => { onSearch(cat); setShowCategories(false); }}
                                          className="text-sm text-gray-500 hover:text-brand-700 hover:font-semibold transition-all"
                                        >
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                       </div>
                  </div>
              </div>
          )}
      </div>
    </nav>
  );
};

export default Navbar;