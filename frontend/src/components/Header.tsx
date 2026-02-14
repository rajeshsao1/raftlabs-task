import { ShoppingCart, UtensilsCrossed, Menu as MenuIcon, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

export function Header() {
  const { getCartCount, currentView, setCurrentView, currentOrder } = useStore();
  const cartCount = getCartCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { label: 'Menu', view: 'menu' as const, icon: UtensilsCrossed },
    { label: 'Cart', view: 'cart' as const, icon: ShoppingCart },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('menu')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              FoodHub
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentView === item.view
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.view === 'cart' && cartCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
            
            {currentOrder && (
              <button
                onClick={() => setCurrentView('tracking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentView === 'tracking'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Track Order
              </button>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {currentOrder && (
              <button
                onClick={() => setCurrentView('tracking')}
                className="p-2 rounded-full bg-green-100 text-green-700"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    setCurrentView(item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentView === item.view
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.view === 'cart' && cartCount > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              ))}
              
              {currentOrder && (
                <button
                  onClick={() => {
                    setCurrentView('tracking');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-green-100 text-green-700"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Track Order
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
