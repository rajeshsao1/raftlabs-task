import { Plus } from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/types';
import { useStore } from '@/store/useStore';

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const { addToCart, setCurrentView } = useStore();
  const [showModal, setShowModal] = useState(false);
  
  const handleAddToCart = () => {
    addToCart(item.id);
    setShowModal(true);
  };
  
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {item.description}
        </p>



        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Add to Cart Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Added to Cart!</h3>
              <p className="text-gray-600 mb-6">What would you like to do next?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCurrentView('cart');
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  Go to Cart
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}