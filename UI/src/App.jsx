import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Product from "./components/Product";
import Home from "./components/Home";
import PlaceOrder from "./components/placeorder";
import Admin from "./components/Admin";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { ProductProvider } from "./context/ProductContext";
import { AuthProvider } from "./context/AuthContext";

// Component to handle redirect on page reload
function RedirectOnReload({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a page reload (navigation type is 'reload')
    const isReload =
      performance.getEntriesByType("navigation")[0]?.type === "reload";

    // If it's a reload and not on home page, redirect to home
    if (isReload && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, []);

  return children;
}

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingCartOpen, setPendingCartOpen] = useState(false);

  // Add item to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update item quantity in cart
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle login requirement with cart reopen flag
  const handleLoginRequired = () => {
    setPendingCartOpen(true);
    setIsLoginOpen(true);
  };

  // Handle login close - reopen cart if pending
  const handleLoginClose = () => {
    setIsLoginOpen(false);
    if (pendingCartOpen) {
      setTimeout(() => {
        setIsCartOpen(true);
        setPendingCartOpen(false);
      }, 300);
    }
  };

  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <RedirectOnReload>
            <div className="min-h-screen bg-gray-50">
              <Navbar
                cartCount={getCartItemCount()}
                onCartClick={() => setIsCartOpen(true)}
                onLoginClick={() => setIsLoginOpen(true)}
              />
              <Login isOpen={isLoginOpen} onClose={handleLoginClose} />
              <Routes>
                <Route
                  path="/"
                  element={
                    <Home
                      cart={cart}
                      updateQuantity={updateQuantity}
                      isCartOpen={isCartOpen}
                      setIsCartOpen={setIsCartOpen}
                      getCartTotal={getCartTotal}
                      removeFromCart={removeFromCart}
                      onLoginRequired={handleLoginRequired}
                    />
                  }
                />
                <Route
                  path="/products"
                  element={
                    <Product
                      addToCart={addToCart}
                      cart={cart}
                      updateQuantity={updateQuantity}
                      isCartOpen={isCartOpen}
                      setIsCartOpen={setIsCartOpen}
                      getCartTotal={getCartTotal}
                      removeFromCart={removeFromCart}
                      onLoginRequired={handleLoginRequired}
                    />
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute
                      requireAdmin={true}
                      onLoginRequired={() => setIsLoginOpen(true)}
                    >
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/placeorder"
                  element={
                    <PlaceOrder
                      clearCart={clearCart}
                      cart={cart}
                      updateQuantity={updateQuantity}
                      isCartOpen={isCartOpen}
                      setIsCartOpen={setIsCartOpen}
                      getCartTotal={getCartTotal}
                      removeFromCart={removeFromCart}
                      onLoginRequired={handleLoginRequired}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </RedirectOnReload>
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
