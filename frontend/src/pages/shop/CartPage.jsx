import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../api/orders';
import toast from 'react-hot-toast';
import { Minus, Plus, Trash2, ShoppingCart, X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { mediaUrl } from '../../api/media';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, updateItem, removeItem, clear, refresh } = useCart();
  const [placing, setPlacing] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ required_date: '', notes: '' });
  const [updating, setUpdating] = useState(null);

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + parseFloat(i.unit_price || 0) * i.quantity, 0);

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    setUpdating(item.id);
    try {
      await updateItem(item.id, newQty);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const handleRemove = async (pk) => {
    try {
      await removeItem(pk);
      toast.success('Item removed');
    } catch { toast.error('Remove failed'); }
  };

  const handleClear = async () => {
    try {
      await clear();
      toast.success('Cart cleared');
    } catch { toast.error('Clear failed'); }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      await placeOrder(orderForm);
      toast.success('Order placed successfully!');
      await refresh();
      setOrderModal(false);
      navigate('/shop/orders');
    } catch (err) {
      const data = err.response?.data;
      toast.error(data ? Object.values(data).flat().join(' ') : 'Order failed');
    } finally { setPlacing(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <span className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );

  if (items.length === 0) return (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-gray-700 text-lg font-semibold">Your cart is empty</p>
      <p className="text-gray-400 text-sm mt-1">Add products from the shop to get started</p>
      <button onClick={() => navigate('/shop')} className="mt-5 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
        Browse Products
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" /> Cart
          <span className="text-sm font-normal text-gray-400 ml-1">({items.length} items)</span>
        </h2>
        <button
          onClick={handleClear}
          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear all
        </button>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const image = item.image;
          const lineTotal = (parseFloat(item.unit_price || 0) * item.quantity).toFixed(2);
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {image ? (
                    <img src={mediaUrl(image)} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                  )}
                </div>

                {/* Name + remove */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{item.product_name}</p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Unit price */}
                  <p className="text-xs text-gray-400 mt-0.5">₹{item.unit_price} each</p>

                  {/* Qty controls + line total */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQty(item, -1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">
                        {updating === item.id
                          ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                          : item.quantity
                        }
                      </span>
                      <button
                        onClick={() => handleQty(item, +1)}
                        disabled={updating === item.id}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <p className="text-xs text-gray-400">₹{item.unit_price} × {item.quantity}</p>
                      <p className="font-bold text-gray-900 text-sm">₹{lineTotal}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm text-gray-500">
              <span className="truncate max-w-[200px]">{item.product_name} × {item.quantity}</span>
              <span>₹{(parseFloat(item.unit_price || 0) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-700">Subtotal</span>
          <span className="text-xl font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={() => setOrderModal(true)}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" /> Place Order
        </button>
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Confirm Order</h3>
              <button onClick={() => setOrderModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handlePlaceOrder} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Date *</label>
                <input
                  type="date"
                  className="input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={orderForm.required_date}
                  onChange={(e) => setOrderForm({ ...orderForm, required_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="input h-20 resize-none"
                  placeholder="Any special instructions..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                />
              </div>

              {/* Summary in modal */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-500">
                    <span className="truncate max-w-[200px]">{item.product_name} × {item.quantity}</span>
                    <span>₹{(parseFloat(item.unit_price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setOrderModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  type="submit"
                  disabled={placing}
                  className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {placing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
