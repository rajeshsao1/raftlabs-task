import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { MenuCard } from './MenuCard';
import { CategoryFilter } from './CategoryFilter';

export function MenuView() {
  const { menuItems, selectedCategory, fetchMenu, isMenuLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void fetchMenu({ category: selectedCategory, search: searchQuery });
  }, [fetchMenu, selectedCategory, searchQuery]);

  const filteredItems = menuItems;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Delicious Food, Delivered Fast
            </h1>
            <p className="text-orange-100 text-lg mb-8">
              Order from the best restaurants in town. Fresh ingredients, amazing taste.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-400 bg-white/95 border border-white/60 focus:bg-white focus:border-white focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <CategoryFilter />
        </div>
      </div>
      
      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'All' ? 'All Dishes' : selectedCategory}
          </h2>
          <span className="text-gray-500">{filteredItems.length} items</span>
        </div>
        
        {isMenuLoading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading menu...</h3>
            <p className="text-gray-500">Fetching items from API</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No dishes found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
