import { useState } from "react";
import {Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import "./App.css";

function App() {
  const [cartItems, setCartItems] = useState([]);
  const[isCartOpen, setIsCartOpen] = useState(false);

  function addToCart(product) {
    const existingProduct = cartItems.find((item) => item.id === product.id);

    if (existingProduct) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }

    setIsCartOpen(true);
  }

  function increaseQuantity(productId) {
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(productId) {
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  }

  const cartProps = {
    cartItems,
    addToCart,
    isCartOpen,
    setIsCartOpen,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  };

  return (
    <Routes>
      <Route path="/" element={<Home {...cartProps} />} />
      <Route path="/produto/:id" element={<ProductDetails {...cartProps} />} />
    </Routes>
  );
}

export default App;
