import { useEffect, useState } from 'react';
import { getShops, updateShopStatus } from '../../api/shops';
import toast from 'react-hot-toast';
import { Store, CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-red-100 text-red-700',
};

const STATUS_ICONS = {
  ACTIVE: <CheckCircle className="w-3.5 h-3.5 inline mr-1" />,
  PENDING: <Clock className="w-3.5 h-3.5 inline mr-1" />,
  INACTIVE: <XCircle className="w-3.5 h-3.5 inline mr-1" />,
};

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const { data } = await getShops(filter);
      setShops(data);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShops(); }, [filter]);

  const handleStatus = async (id, newStatus) => {
    try {
      await updateShopStatus(id, newStatus);
      toast.success(`Shop ${newStatus.toLowerCase()}d successfully`);
      setShops((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Store className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shop Management</h1>
            <p className="text-sm text-gray-500">Approve or reject registered shops</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {['', 'PENDING', 'ACTIVE', 'INACTIVE'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shops.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No shops found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Shop Name', 'Owner', 'Place', 'Mobile', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{shop.shop_name}</td>
                  <td className="px-4 py-3 text-gray-600">{shop.owner_name}</td>
                  <td className="px-4 py-3 text-gray-600">{shop.place}</td>
                  <td className="px-4 py-3 text-gray-600">{shop.mobile_number}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[shop.status]}`}>
                      {STATUS_ICONS[shop.status]}{shop.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {shop.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatus(shop.id, 'INACTIVE')}
                          className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatus(shop.id, 'ACTIVE')}
                            className="px-2.5 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors font-medium"
                          >
                            Approve
                          </button>
                          {shop.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatus(shop.id, 'INACTIVE')}
                              className="px-2.5 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
