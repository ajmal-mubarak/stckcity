import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ShoppingCart, ClipboardList, LogOut, Menu, X, Store } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ShopLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">StockCity</span>
          </div>

          {/* Shop name */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 ml-2">
            <Store className="w-4 h-4" />
            <span>{user?.shop_name || user?.mobile_number}</span>
          </div>

          <div className="flex-1" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/shop"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/shop/orders"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <ClipboardList className="w-4 h-4" /> My Orders
            </NavLink>
          </nav>

          {/* Cart */}
          <NavLink
            to="/shop/cart"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-900">Menu</span>
              <button onClick={() => setMenuOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <nav className="space-y-1">
              <NavLink to="/shop" end onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                Products
              </NavLink>
              <NavLink to="/shop/orders" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                My Orders
              </NavLink>
              <NavLink to="/shop/cart" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                Cart ({cartCount})
              </NavLink>
              <button onClick={handleLogout}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
