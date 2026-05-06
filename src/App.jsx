import { useState } from "react";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [cartItems, setCartItems] = useState([]);
  const[isCartOpen, setIsCartOpen] = useState(false);

  function addToCart(product) {
    const existing = cartItems.find((item) => item.id === product.id);

    if (existing) {
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

  return (
    <Home
      cartItems={cartItems}
      addToCart={addToCart}
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
      increaseQuantity={increaseQuantity}
      decreaseQuantity={decreaseQuantity}
      removeFromCart={removeFromCart}
    />
  );
}

export default App;
