import { useContext } from 'react';
import CartContext from '../context/CartContext';

/**
 * Custom hook untuk menggunakan CartContext
 * 
 * Usage:
 * const { cartItems, addToCart, removeFromCart, getTotalPrice } = useCart();
 */
const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

export default useCart;