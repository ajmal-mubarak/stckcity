import { useEffect, useState } from 'react';
import { getDashboard } from '../../api/dashboard';
import {
  Store, Package, ShoppingCart, TrendingUp,
  Clock, CheckCircle, Truck, XCircle, AlertCircle, PackageCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PACKED: '#8b5cf6',
  DISPATCHED: '#06b6d4',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PACKED: PackageCheck,
  DISPATCHED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statusData = data?.order_status_breakdown
    ? Object.entries(data.order_status_breakdown).map(([name, count]) => ({ name, count }))
    : [];

  const recentOrders = data?.recent_orders || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Overview of your distribution business</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Store} label="Total Shops" value={data?.total_shops} color="bg-indigo-500" />
        <StatCard icon={AlertCircle} label="Active Shops" value={data?.active_shops} color="bg-emerald-500" />
        <StatCard icon={Package} label="Total Products" value={data?.total_products} color="bg-orange-500" />
        <StatCard icon={ShoppingCart} label="Orders Today" value={data?.today_orders} color="bg-cyan-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Order Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  domain={[0, 'auto']}
                  allowDecimals={false}
                  tickCount={6}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-10 text-center">No order data</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((o) => {
                const StatusIcon = STATUS_ICONS[o.status] || Clock;
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLORS[o.status] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{o.order_number}</p>
                      <p className="text-xs text-gray-500">{o.shop_name}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">₹{o.total_amount}</span>
                    <span
                      className="badge text-white text-xs"
                      style={{ backgroundColor: STATUS_COLORS[o.status] || '#6b7280' }}
                    >
                      {o.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-10 text-center">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
}
