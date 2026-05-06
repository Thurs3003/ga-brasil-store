import { useState } from "react";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(product) {
    const existing = cartItems.find((item) => item.id === product.id);

    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  }

  return (
    <Home
      cartItems={cartItems}
      addToCart={addToCart}
    />
  );
}

export default App;