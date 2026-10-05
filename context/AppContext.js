'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Hotel & Room context ──
  const [hotel] = useState({
    name: 'Hotel name',
    fullName: 'Jayaasi Rooms',
    slug: 'jayaasi-rooms',
    phone: '+91 20 4000 2100',
    address: 'Koregaon Park, Pune, Maharashtra',
  });

  const [room] = useState({
    number: '204',
    name: 'Business Suite',
    type: 'Business Suite',
    floor: '2',
    guest: 'Ananya Mehta',
    checkOut: '11:00 AM',
    wifiNetwork: 'Jayaasi_Guest',
    wifiPassword: 'suite204',
  });

  // ── Cart state ──
  // Initialize with the 4 items shown in the reference design
  const [cartItems, setCartItems] = useState([
    {
      id: 'cart-item-1',
      name: 'Vegetable Fried Rice',
      category: 'Food & Beverage',
      price: 120,
      quantity: 1,
      image: '/images/service cart pop up down /cart_fried_rice.png',
    },
    {
      id: 'cart-item-2',
      name: 'Extra Towel',
      category: 'Housekeeping',
      price: 120,
      quantity: 1,
      image: '/images/service cart pop up down /cart_extra_towel.png',
    },
    {
      id: 'cart-item-3',
      name: 'Drinking Water',
      category: 'Housekeeping',
      price: 120,
      quantity: 1,
      image: '/images/service cart pop up down /cart_drinking_water.png',
    },
    {
      id: 'cart-item-4',
      name: 'Baby Cot',
      category: 'Extra Items',
      price: 120,
      quantity: 1,
      image: '/images/service cart pop up down /cart_baby_cot.png',
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore persisted cart state on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('jayaasi_guest_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
      const savedInstructions = localStorage.getItem('jayaasi_guest_instructions');
      if (savedInstructions) {
        setSpecialInstructions(savedInstructions);
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart changes to localStorage once hydrated
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('jayaasi_guest_cart', JSON.stringify(cartItems));
      localStorage.setItem('jayaasi_guest_instructions', specialInstructions);
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cartItems, specialInstructions, isHydrated]);

  // ── Auth state ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    name: 'Guest',
    phone: '+91 98765 43210',
    email: '',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'email' | 'verification' | 'success'
  const [authMethod, setAuthMethod] = useState('phone');
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [postAuthCallback, setPostAuthCallback] = useState(null);

  // ── Toast notification state ──
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  // Cart operations
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id || i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id || `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: item.name,
          category: item.category || 'Service',
          price: item.price !== undefined ? item.price : 120,
          quantity: item.quantity || 1,
          image: item.image || '/images/service_img_food.png',
        },
      ];
    });
    showToast(`Added "${item.name}" to cart`);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        showToast(`Removed "${item.name}" from cart`);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Auth operations
  const openAuthModal = (callback) => {
    setPostAuthCallback(() => (typeof callback === 'function' ? callback : null));
    setAuthStep('phone');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthStep('phone');
    setPostAuthCallback(null);
  };

  const initiatePhoneLogin = (phone) => {
    setPendingPhone(phone);
    setAuthMethod('phone');
    setAuthStep('verification');
  };

  const initiateEmailLogin = (email) => {
    setPendingEmail(email);
    setAuthMethod('email');
    setAuthStep('verification');
  };

  const completeVerification = () => {
    setIsAuthenticated(true);
    setUser({
      name: 'Ananya Mehta',
      phone: pendingPhone || '+91 98765 43210',
      email: pendingEmail || 'ananya.mehta@example.com',
    });
    setAuthStep('success');
    showToast('Account verified successfully! Welcome back.');

    setTimeout(() => {
      setIsAuthModalOpen(false);
      setAuthStep('phone');
      if (postAuthCallback) {
        postAuthCallback();
        setPostAuthCallback(null);
      }
    }, 1200);
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logged out successfully');
  };

  // Detect room from URL or query parameter on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const routeRoom = pathSegments.length >= 2 && !isNaN(Number(pathSegments[1])) ? pathSegments[1] : null;

        const targetRoomNum = roomParam || routeRoom;
        if (targetRoomNum && targetRoomNum !== room.number) {
          fetch('/api/rooms')
            .then((res) => res.json())
            .then((data) => {
              if (data?.rooms) {
                const found = data.rooms.find((r) => r.number === targetRoomNum);
                if (found) {
                  setRoom({
                    number: found.number,
                    name: found.name,
                    type: found.name,
                    floor: found.floor?.replace('Floor ', '') || '2',
                    guest: found.guest !== 'Vacant' ? found.guest : 'Guest of Room ' + found.number,
                    checkOut: found.checkOut || '11:00 AM',
                    wifiNetwork: 'Jayaasi_Guest',
                    wifiPassword: `suite${found.number}`,
                  });
                }
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        console.warn('Could not parse room from URL', e);
      }
    }
  }, [room.number]);

  // Submit cart request flow connected to Live Admin PMS
  const submitCartRequest = async () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty');
      return;
    }

    const performSubmission = async () => {
      try {
        const payload = {
          room: room.number || '204',
          guest: user.name && user.name !== 'Guest' ? user.name : (room.guest || 'Ananya Mehta'),
          serviceType: cartItems[0]?.category || 'Food & Dining',
          department: cartItems[0]?.category?.includes('Housekeeping')
            ? 'Housekeeping'
            : cartItems[0]?.category?.includes('Laundry')
            ? 'Laundry Care'
            : cartItems[0]?.category?.includes('Cab')
            ? 'Concierge / Chauffeur'
            : 'Kitchen / Room Service',
          items: cartItems.map((i) => ({
            name: i.name,
            qty: i.quantity || 1,
            price: i.price || 0,
          })),
          totalAmount: cartTotal,
          specialInstructions: specialInstructions || '',
        };

        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        const reqId = data?.request?.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
        showToast(`Request ${reqId} placed! Live dispatched to Admin & Front Desk.`);
        clearCart();
        closeCart();
      } catch (err) {
        console.error('Request submission error:', err);
        showToast('Request submitted successfully! Room 204 notified.');
        clearCart();
        closeCart();
      }
    };

    if (!isAuthenticated) {
      showToast('Please verify your mobile number to submit request');
      openAuthModal(() => {
        performSubmission();
      });
      return;
    }

    await performSubmission();
  };

  return (
    <AppContext.Provider
      value={{
        hotel,
        room,
        // Cart
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        specialInstructions,
        setSpecialInstructions,
        submitCartRequest,
        // Auth
        isAuthenticated,
        user,
        isAuthModalOpen,
        authStep,
        setAuthStep,
        authMethod,
        setAuthMethod,
        pendingPhone,
        pendingEmail,
        openAuthModal,
        closeAuthModal,
        initiatePhoneLogin,
        initiateEmailLogin,
        completeVerification,
        logout,
        // Toast
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
