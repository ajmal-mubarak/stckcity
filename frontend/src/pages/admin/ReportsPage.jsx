import { useState, useEffect } from 'react';
import { downloadOrdersPDF, downloadOrdersExcel, triggerDownload } from '../../api/reports';
import { getShops } from '../../api/shops';
import toast from 'react-hot-toast';
import { FileText, FileSpreadsheet, Info, X } from 'lucide-react';

export default function ReportsPage() {
  const [filters, setFilters] = useState({ start_date: '', end_date: '', status: '', shop: '' });
  const [loading, setLoading] = useState({ pdf: false, excel: false });
  const [shops, setShops] = useState([]);

  const STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    getShops()
      .then(({ data }) => setShops(data))
      .catch(() => {});
  }, []);

  const handleDownload = async (type) => {
    setLoading((l) => ({ ...l, [type]: true }));
    try {
      // Only include non-empty filters — empty = no restriction = all records
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      let res;
      if (type === 'pdf') {
        res = await downloadOrdersPDF(params);
        triggerDownload(res.data, 'orders.pdf');
      } else {
        res = await downloadOrdersExcel(params);
        triggerDownload(res.data, 'orders.xlsx');
      }
      toast.success(`${type.toUpperCase()} downloaded`);
    } catch {
      toast.error('Download failed');
    } finally {
      setLoading((l) => ({ ...l, [type]: false }));
    }
  };

  const clearFilters = () =>
    setFilters({ start_date: '', end_date: '', status: '', shop: '' });

  const hasFilters = Object.values(filters).some(Boolean);

  // Build a human-readable summary of what will be downloaded
  const summaryParts = [];
  if (filters.start_date && filters.end_date)
    summaryParts.push(`${filters.start_date} → ${filters.end_date}`);
  else if (filters.start_date)
    summaryParts.push(`From ${filters.start_date}`);
  else if (filters.end_date)
    summaryParts.push(`Until ${filters.end_date}`);
  else
    summaryParts.push('All dates');

  if (filters.status) summaryParts.push(filters.status);
  else summaryParts.push('All statuses');

  const selectedShop = shops.find((s) => String(s.id) === String(filters.shop));
  summaryParts.push(selectedShop ? selectedShop.shop_name : 'All shops');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-0.5">Download order reports in PDF or Excel format</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Order Reports</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              className="input"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              className="input"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Shop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
            <select
              className="input"
              value={filters.shop}
              onChange={(e) => setFilters({ ...filters, shop: e.target.value })}
            >
              <option value="">All Shops</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shop_name} — {s.place}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter summary banner */}
        <div className="flex items-center gap-2 px-3 py-2 mb-5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
          <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span>
            Report will include: <strong>{summaryParts.join(' · ')}</strong>
          </span>
        </div>

        {/* Download buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={loading.pdf}
            className="btn-primary flex items-center gap-2"
          >
            {loading.pdf
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FileText className="w-4 h-4" /> Download PDF</>
            }
          </button>
          <button
            onClick={() => handleDownload('excel')}
            disabled={loading.excel}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading.excel
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FileSpreadsheet className="w-4 h-4" /> Download Excel</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
