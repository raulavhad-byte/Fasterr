import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Sell from './pages/Sell';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Favorites from './pages/Favorites';
import MyListings from './pages/MyListings';
import { User } from './types';
import { getCurrentUser } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [smartFilters, setSmartFilters] = useState<any>(null);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-16 md:pb-0">
        <Navbar 
            user={user} 
            setUser={setUser} 
            onSearch={setSearchQuery} 
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            onSmartFilters={setSmartFilters}
        />
        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} locationFilter={selectedLocation} smartFilters={smartFilters} />} />
          <Route path="/sell" element={<Sell user={user} />} />
          <Route path="/product/:id" element={<ProductDetail user={user} />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/my-listings" element={<MyListings user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;