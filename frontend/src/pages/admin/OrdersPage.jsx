import { useEffect, useState, useCallback } from 'react';
import { getAdminOrders, updateOrderStatus } from '../../api/orders';
import toast from 'react-hot-toast';
import { Search, X, ChevronDown } from 'lucide-react';

const STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-purple-100 text-purple-700',
  DISPATCHED: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await getAdminOrders(params);
      setOrders(data.results || data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, { status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9 w-52"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Order #</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Shop</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Mobile</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Update</th>
                <th className="px-4 py-3 font-semibold text-gray-600">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <span className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <p className="font-medium">{o.shop_name || '—'}</p>
                    <p className="text-xs text-gray-400">{o.shop_place}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{o.shop_mobile}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{o.total_amount}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        className="input py-1 pr-7 text-xs w-36 appearance-none"
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetail(o)}
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Order {detail.order_number}</h3>
              <button onClick={() => setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Shop Info Card */}
              <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Shop Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Shop Name</p>
                    <p className="font-semibold text-gray-900">{detail.shop_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Mobile</p>
                    <p className="font-semibold text-gray-900">{detail.shop_mobile || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Place</p>
                    <p className="font-medium text-gray-800">{detail.shop_place || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Address</p>
                    <p className="font-medium text-gray-800">{detail.shop_address || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Status</p>
                  <span className={`badge ${STATUS_COLORS[detail.status]}`}>{detail.status}</span>
                </div>
                <div><p className="text-gray-500">Total</p><p className="font-semibold text-gray-900">₹{detail.total_amount}</p></div>
                <div><p className="text-gray-500">Required Date</p><p className="font-medium">{detail.required_date}</p></div>
                <div><p className="text-gray-500">Ordered On</p><p className="font-medium">{new Date(detail.created_at).toLocaleDateString()}</p></div>
              </div>

              {detail.notes && (
                <div><p className="text-gray-500 text-sm">Notes</p><p className="text-sm mt-0.5">{detail.notes}</p></div>
              )}

              {/* Order Items */}
              <div>
                <p className="font-medium text-gray-700 mb-2 text-sm">Order Items</p>
                <div className="space-y-2">
                  {(detail.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity} × ₹{item.unit_price}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
