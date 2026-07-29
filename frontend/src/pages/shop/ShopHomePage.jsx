import { useEffect, useState, useCallback } from 'react';
import { getProducts, getBrands, getCategories, getProduct } from '../../api/catalog';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { Search, ShoppingCart, Package, X, Plus, Minus, Star } from 'lucide-react';

import { mediaUrl } from '../../api/media';

// ── Product Detail Modal ────────────────────────────────────────────────────
function ProductModal({ product, onClose }) {
  const { addItem, cartCount } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState(product);

  useEffect(() => {
    getProduct(product.id).then(({ data }) => setDetail(data)).catch(() => {});
  }, [product.id]);

  const image = detail.images?.[0]?.image || detail.image;
  const imageUrl = mediaUrl(image);
  const maxQty = detail.stock || 0;

  const handleAdd = async () => {
    if (qty < 1 || maxQty === 0) return;
    setAdding(true);
    try {
      await addItem(detail.id, qty);
      toast.success(`Added ${qty} × ${detail.name} to cart`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-video bg-gray-100 rounded-t-2xl overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={detail.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package className="w-16 h-16" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          {maxQty === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white font-semibold px-4 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Meta */}
          <div className="flex gap-2 flex-wrap">
            {detail.brand_name && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{detail.brand_name}</span>
            )}
            {detail.category_name && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{detail.category_name}</span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{detail.name}</h2>
            {detail.description && (
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{detail.description}</p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{detail.price}</p>
              <p className="text-xs text-gray-400 mt-0.5">{maxQty > 0 ? `${maxQty} in stock` : 'Out of stock'}</p>
            </div>
            {maxQty > 0 && (
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-600 font-medium mr-2">Qty:</p>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Subtotal preview */}
          {maxQty > 0 && qty > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <span>Subtotal ({qty} items)</span>
              <span className="font-bold text-gray-900">₹{(parseFloat(detail.price) * qty).toFixed(2)}</span>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={maxQty === 0 || adding}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {adding
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function ShopHomePage() {
  const { addItem, removeItem, cart } = useCart();
  const cartProductIds = new Set((cart?.items || []).map((i) => i.product));
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [adding, setAdding] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (brandFilter) params.brand = brandFilter;
      if (categoryFilter) params.category = categoryFilter;
      const [p, b, c] = await Promise.all([
        getProducts(params),
        getBrands(),
        getCategories(),
      ]);
      setProducts(p.data.results || p.data);
      setBrands(b.data.results || b.data);
      setCategories(c.data.results || c.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [search, brandFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const [removing, setRemoving] = useState(null);

  const handleCartToggle = async (e, product) => {
    e.stopPropagation();
    const cartItem = (cart?.items || []).find((i) => i.product === product.id);
    if (cartItem) {
      // Already in cart → remove it
      setRemoving(product.id);
      try {
        await removeItem(cartItem.id);
        toast.success('Removed from cart');
      } catch {
        toast.error('Failed to remove');
      } finally { setRemoving(null); }
    } else {
      // Not in cart → open detail modal to pick quantity
      setSelectedProduct(product);
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome to StockCity</h1>
        <p className="text-gray-400 text-sm">Browse our latest mobile phones and accessories</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          className="input pl-9 w-full"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Brands row */}
      {brands.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Brands</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setBrandFilter('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                brandFilter === ''
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => { setBrandFilter(String(b.id)); setCategoryFilter(''); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  brandFilter === String(b.id)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories row */}
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Categories</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                categoryFilter === ''
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCategoryFilter(String(c.id)); setBrandFilter(''); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  categoryFilter === String(c.id)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => {
            const image = p.images?.[0]?.image || p.image;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  {image ? (
                    <img
                      src={mediaUrl(image)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-red-500 px-2 py-0.5 rounded-full">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{p.brand_name || ''}</p>
                  <p className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-2">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-base">₹{p.price}</span>
                    {(() => {
                      const inCart = cartProductIds.has(p.id);
                      const busy = adding === p.id || removing === p.id;
                      return (
                        <button
                          onClick={(e) => handleCartToggle(e, p)}
                          disabled={p.stock === 0 || busy}
                          title={inCart ? 'Remove from cart' : 'Add to cart'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                            inCart
                              ? 'bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-1 hover:bg-red-600 hover:ring-red-600'
                              : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900'
                          }`}
                        >
                          {busy
                            ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <ShoppingCart className={`w-4 h-4 ${inCart ? 'fill-white' : ''}`} />
                          }
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
