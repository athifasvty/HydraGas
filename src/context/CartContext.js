import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Context
const CartContext = createContext();

// Storage key
const CART_STORAGE_KEY = 'shopping_cart';

// Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart dari AsyncStorage saat app dibuka
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart ke AsyncStorage setiap kali cartItems berubah
  useEffect(() => {
    if (!isLoading) {
      saveCart();
    }
  }, [cartItems]);

  /**
   * Load cart from AsyncStorage
   */
  const loadCart = async () => {
    try {
      setIsLoading(true);
      const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save cart to AsyncStorage
   */
  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  /**
   * Add item to cart
   * @param {Object} product - {id, nama_produk, jenis, harga, stok}
   * @param {number} quantity
   */
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      // Cek apakah produk sudah ada di cart
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Tambah item baru
        return [
          ...prevItems,
          {
            id: product.id,
            nama_produk: product.nama_produk,
            jenis: product.jenis,
            harga: product.harga,
            stok: product.stok,
            quantity: quantity,
          },
        ];
      }
    });
  };

  /**
   * Remove item from cart
   * @param {number} productId
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  /**
   * Update quantity
   * @param {number} productId
   * @param {number} newQuantity
   */
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  /**
   * Increase quantity
   */
  const increaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  /**
   * Decrease quantity
   */
  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const newQuantity = item.quantity - 1;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Get total items in cart
   */
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Get total price
   */
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.harga * item.quantity,
      0
    );
  };

  /**
   * Check if product is in cart
   */
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  /**
   * Get item quantity in cart
   */
  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  /**
   * Get cart items for API (format untuk backend)
   */
  const getCartItemsForAPI = () => {
    return cartItems.map((item) => ({
      id_produk: item.id,
      jumlah: item.quantity,
    }));
  };

  // Context value
  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity,
    getCartItemsForAPI,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook untuk pakai CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;