import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Admin pages
import AdminLayout from '../components/admin/AdminLayout';
import DashboardPage from '../pages/admin/DashboardPage';
import ProductsPage from '../pages/admin/ProductsPage';
import BrandsPage from '../pages/admin/BrandsPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import OrdersPage from '../pages/admin/OrdersPage';
import ReportsPage from '../pages/admin/ReportsPage';
import ShopsPage from '../pages/admin/ShopsPage';

// Shop pages
import ShopLayout from '../components/shop/ShopLayout';
import ShopHomePage from '../pages/shop/ShopHomePage';
import CartPage from '../pages/shop/CartPage';
import MyOrdersPage from '../pages/shop/MyOrdersPage';

function RequireAuth({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_staff) return <Navigate to="/shop" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.is_staff ? '/admin' : '/shop'} replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin */}
        <Route path="/admin" element={
          <RequireAuth adminOnly>
            <AdminLayout />
          </RequireAuth>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="shops" element={<ShopsPage />} />
        </Route>

        {/* Shop */}
        <Route path="/shop" element={
          <RequireAuth>
            <ShopLayout />
          </RequireAuth>
        }>
          <Route index element={<ShopHomePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
