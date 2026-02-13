import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { MenuView } from '@/components/MenuView';
import { CartView } from '@/components/CartView';
import { CheckoutView } from '@/components/CheckoutView';
import { OrderTrackingView } from '@/components/OrderTrackingView';

export function App() {
  const { currentView } = useStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {currentView === 'menu' && <MenuView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'tracking' && <OrderTrackingView />}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">F</span>
              </div>
              <span className="font-bold text-gray-900">FoodHub</span>
            </div>

            {/* Task completed by Rajesh Kumar (rajeshsao91@gmail.com) */}
            <p className="text-gray-500 text-sm text-center">
              © 2026 FoodHub. Task completed by{' '}
              <span className="font-medium text-gray-700">Rajesh Kumar</span> —{' '}
              <a
                href="mailto:rajeshsao91@gmail.com"
                className="text-gray-600 hover:text-gray-800 underline underline-offset-2"
              >
                rajeshsao91@gmail.com
              </a>
            </p>

            <div className="flex items-center gap-4">
              <a
                href="http://localhost:3001/api/health"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                Site Health
              </a>
              <a
                href="http://localhost:3001/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                Status Page
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Version"
              >
                v1.0.0
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Changelog"
              >
                Changelog
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
