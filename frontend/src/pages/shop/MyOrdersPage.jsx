import { useEffect, useState } from 'react';
import { getMyOrders, getOrderDetail, cancelOrder } from '../../api/orders';
import toast from 'react-hot-toast';
import { ClipboardList, ChevronDown, ChevronUp, X } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-purple-100 text-purple-700',
  DISPATCHED: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then((r) => setOrders(r.data.results || r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (orderId) => {
    if (expanded === orderId) { setExpanded(null); setDetail(null); return; }
    setExpanded(orderId);
    try {
      const { data } = await getOrderDetail(orderId);
      setDetail(data);
    } catch { toast.error('Failed to load order detail'); }
  };

  const handleCancel = async (orderId) => {
    setCancelling(orderId);
    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled');
      const { data } = await getMyOrders();
      setOrders(data.results || data);
      setExpanded(null);
      setDetail(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot cancel this order');
    } finally { setCancelling(null); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <span className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-24">
      <ClipboardList className="w-16 h-16 mx-auto text-gray-200 mb-4" />
      <p className="text-gray-500 text-lg font-medium">No orders yet</p>
      <p className="text-gray-400 text-sm mt-1">Place your first order from the shop</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card overflow-hidden">
            {/* Order header */}
            <button
              onClick={() => toggleExpand(o.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-mono text-sm font-semibold text-gray-900">{o.order_number}</p>
                  <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(o.created_at).toLocaleDateString()} · Required: {o.required_date}
                </p>
              </div>
              <span className="font-bold text-gray-900">₹{o.total_amount}</span>
              {expanded === o.id
                ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              }
            </button>

            {/* Expanded detail */}
            {expanded === o.id && detail && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                {detail.notes && (
                  <p className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {detail.notes}</p>
                )}
                <div className="space-y-2">
                  {(detail.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm p-2.5 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>
                {o.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(o.id)}
                    disabled={cancelling === o.id}
                    className="btn-danger w-full flex items-center justify-center gap-2 py-2"
                  >
                    {cancelling === o.id
                      ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><X className="w-4 h-4" /> Cancel Order</>
                    }
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
