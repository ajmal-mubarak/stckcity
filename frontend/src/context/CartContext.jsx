import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../api/orders';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await getCart();
      setCart(data);
    } catch {
      // not logged in yet — ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const cartCount = (cart.items || []).reduce((s, i) => s + i.quantity, 0);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const { data } = await addToCart({ product: productId, quantity });
    setCart(data);
    return data;
  }, []);

  const updateItem = useCallback(async (pk, quantity) => {
    const { data } = await updateCartItem(pk, { quantity });
    setCart(data);
    return data;
  }, []);

  const removeItem = useCallback(async (pk) => {
    await removeCartItem(pk);
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== pk),
    }));
  }, []);

  const clear = useCallback(async () => {
    await clearCart();
    setCart({ items: [], total: 0 });
  }, []);

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
