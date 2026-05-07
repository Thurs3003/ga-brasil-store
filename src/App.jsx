import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("@ga-brasil:cart");

    if (savedCart) {
      return JSON.parse(savedCart);
    }

    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const savedFavorites = localStorage.getItem("@ga-brasil:favorites");

    if (savedFavorites) {
      return JSON.parse(savedFavorites);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem("@ga-brasil:cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("@ga-brasil:favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

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

    setToastMessage(`${product.name} adicionado ao carrinho`);

    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  function increaseQuantity(productId) {
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decreaseQuantity(productId) {
    setCartItems(
      cartItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId) {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  }

  function toggleFavorite(productId) {
    if (favoriteIds.includes(productId)) {
      setFavoriteIds(favoriteIds.filter((id) => id !== productId));
    } else {
      setFavoriteIds([...favoriteIds, productId]);
    }
  }

  const cartProps = {
    cartItems,
    addToCart,
    isCartOpen,
    setIsCartOpen,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    favoriteIds,
    toggleFavorite,
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Home {...cartProps} toastMessage={toastMessage} />}
      />
    </Routes>
  );
}

export default App;
