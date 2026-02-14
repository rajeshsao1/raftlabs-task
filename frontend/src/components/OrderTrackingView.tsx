import { useEffect, useState } from 'react';
import { CheckCircle, Clock, ChefHat, Truck, Home, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { OrderStatus, Order, StatusUpdate } from '@/types';
import { getOrder, getStatusUpdates, subscribeToOrderStatus } from '@/services/api';

interface StatusStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ElementType;
}

const statusSteps: StatusStep[] = [
  {
    status: 'pending',
    label: 'Order Received',
    description: 'Your order has been received',
    icon: Clock
  },
  {
    status: 'confirmed',
    label: 'Confirmed',
    description: 'Order confirmed by restaurant',
    icon: CheckCircle
  },
  {
    status: 'preparing',
    label: 'Preparing',
    description: 'Your food is being prepared',
    icon: ChefHat
  },
  {
    status: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Driver is on the way',
    icon: Truck
  },
  {
    status: 'delivered',
    label: 'Delivered',
    description: 'Enjoy your meal!',
    icon: Home
  }
];

export function OrderTrackingView() {
  const { currentOrderId, currentOrder, setCurrentOrder, statusUpdates, setStatusUpdates, setCurrentView, orderHistory } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 11000);
    return () => clearInterval(timer);
  }, []);

  // Load + subscribe to backend updates
  useEffect(() => {
    const orderId = currentOrderId || currentOrder?.id || orderHistory[0]?.id;
    if (!orderId) return;

    let unsub: null | (() => void) = null;
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [oRes, uRes] = await Promise.all([getOrder(orderId), getStatusUpdates(orderId)]);
        if (cancelled) return;

        if (!oRes.success || !oRes.data) throw new Error(oRes.error || 'Order not found');
        setCurrentOrder(oRes.data);
        setStatusUpdates((uRes.success && uRes.data) ? uRes.data : []);

        unsub = subscribeToOrderStatus(orderId, (order: Order, updates: StatusUpdate[]) => {
          setCurrentOrder(order);
          setStatusUpdates(updates);
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [currentOrderId, currentOrder?.id, orderHistory, setCurrentOrder, setStatusUpdates]);
  
  // If no current order, check history
  const displayOrder = currentOrder || orderHistory[0];
  
  if (!displayOrder || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Order...</h2>
          <p className="text-gray-500 mb-6">Fetching latest status from server.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load order</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => setCurrentView('menu')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  if (!displayOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Orders</h2>
          <p className="text-gray-500 mb-6">Place an order to track it here!</p>
          <button
            onClick={() => setCurrentView('menu')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }
  
  const currentStatusIndex = statusSteps.findIndex(s => s.status === displayOrder.status);
  
  const getEstimatedTime = () => {
    const createdAt = new Date(displayOrder.createdAt);
    const minutesElapsed = Math.floor((currentTime.getTime() - createdAt.getTime()) / 60000);
    const totalMinutes = 15;
    const remaining = Math.max(0, totalMinutes - minutesElapsed);
    return remaining;
  };

  const getOrderCompletionTime = () => {
    if (displayOrder.status !== 'delivered') return null;

    const deliveredUpdate = [...statusUpdates]
      .reverse()
      .find((u) => u.status === 'delivered');

    const endTime = deliveredUpdate?.timestamp ? new Date(deliveredUpdate.timestamp) : currentTime;
    const startTime = new Date(displayOrder.createdAt);

    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.max(0, Math.round(diffMs / 60000));

    return { diffMins, endTime };
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-green-100 text-sm mb-1">Order #{displayOrder.id}</p>
              <h1 className="text-2xl font-bold mb-2">Order {statusSteps[currentStatusIndex]?.label}</h1>
              {displayOrder.status !== 'delivered' ? (
                <p className="text-green-100">
                  Estimated delivery in {getEstimatedTime()} minutes
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-green-100 text-sm">Current Time</p>
              </div>
            </div>

            {displayOrder.status === 'delivered' && (() => {
              const completion = getOrderCompletionTime();
              if (!completion) return null;

              return (
                <div className="mt-4 rounded-xl bg-white/10 border border-white/20 px-4 py-3">
                  <p className="text-sm text-green-50">
                    Order completed in <span className="font-semibold">{completion.diffMins} min</span>
                  </p>
                  <p className="text-xs text-green-100">
                    Delivered at {completion.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status Tracker */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-200">
                  <div
                    className="bg-gradient-to-b from-green-500 to-emerald-500 w-full transition-all duration-1000"
                    style={{ height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
                
                {/* Steps */}
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.status} className="relative flex items-start gap-4 pl-2">
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
                              : 'bg-gray-100 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full animate-pulse">
                                In Progress
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Live Updates */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Live Updates</h2>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {statusUpdates.length > 0 ? (
                  statusUpdates.map((update, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl animate-fade-in"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse" />
                      <div>
                        <p className="font-medium text-gray-900">{update.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Waiting for updates...</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{displayOrder.deliveryDetails.name}</p>
                    <p className="text-sm text-gray-500">{displayOrder.deliveryDetails.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <p className="text-gray-600">{displayOrder.deliveryDetails.phone}</p>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {displayOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">${displayOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setCurrentView('menu')}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200"
              >
                Order Again
              </button>
              
              {displayOrder.status === 'delivered' && (
                <button className="w-full px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Leave a Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
