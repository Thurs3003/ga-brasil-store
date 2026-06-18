import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import ProductPage from "./pages/ProductPage";
import "./App.css";
import { supabase } from "./lib/supabaseClient";
import { loadSettings, startSettingsSync } from "./lib/settings";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUser } from "./hooks/useUser";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const CustomerRegister = lazy(() => import("./pages/CustomerRegister"));
const CustomerResetPassword = lazy(() => import("./pages/CustomerResetPassword"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Promocoes = lazy(() => import("./pages/Promocoes"));

function App() {
  const { user, profile } = useUser();
  const [supabaseProducts, setSupabaseProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("@ga-brasil:cart");
    const items = savedCart ? JSON.parse(savedCart) : [];
    // Compat: itens sem cartKey (salvos antes das variantes) recebem cartKey = id
    return items.map((item) => ({ ...item, cartKey: item.cartKey ?? String(item.id) }));
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [favoriteIds, setFavoriteIds] = useState(() => {
    const savedFavorites = localStorage.getItem("@ga-brasil:favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase.from("products").select("*");

      if (error) return;

      const formattedProducts = (data || []).map((product) => ({
        ...product,
        oldPrice: product.old_price,
        isNew: product.is_new,
        gallery: product.gallery || [],
      }));

      setSupabaseProducts(formattedProducts);
      setIsLoadingProducts(false);
    }

    loadProducts();
    loadSettings();
    const channel = startSettingsSync();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    localStorage.setItem("@ga-brasil:cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("@ga-brasil:favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  function addToCart(product) {
    const cartKey = product.selectedVariant
      ? `${product.id}__${product.selectedVariant}`
      : String(product.id);
    const existing = cartItems.find((item) => item.cartKey === cartKey);
    if (existing) {
      setCartItems(cartItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item,
      ));
    } else {
      setCartItems([...cartItems, { ...product, cartKey, quantity: 1 }]);
    }
    setIsCartOpen(true);
    const variantSuffix = product.selectedVariant ? ` (${product.selectedVariant})` : "";
    setToastMessage(`${product.name}${variantSuffix} adicionado ao carrinho`);
    setTimeout(() => setToastMessage(""), 2500);
  }

  function increaseQuantity(cartKey) {
    setCartItems(cartItems.map((item) =>
      item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item,
    ));
  }

  function decreaseQuantity(cartKey) {
    setCartItems(
      cartItems
        .map((item) => item.cartKey === cartKey ? { ...item, quantity: item.quantity - 1 } : item)
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(cartKey) {
    setCartItems(cartItems.filter((item) => item.cartKey !== cartKey));
  }

  async function repeatOrderToCart(items) {
    const ids = items.map((i) => i.id);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, brand, price, old_price, is_new, image, stock, installment, rating, category")
      .in("id", ids);
    if (!products) return;
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    setCartItems((prev) => {
      const merged = [...prev];
      items.forEach((item) => {
        const product = productMap[item.id];
        if (!product) return;
        const selectedVariant = item.selectedVariant ?? undefined;
        const cartKey = selectedVariant ? `${product.id}__${selectedVariant}` : String(product.id);
        const existingIdx = merged.findIndex((i) => i.cartKey === cartKey);
        if (existingIdx >= 0) {
          merged[existingIdx] = { ...merged[existingIdx], quantity: merged[existingIdx].quantity + item.quantity };
        } else {
          merged.push({ ...product, oldPrice: product.old_price, isNew: product.is_new, selectedVariant, cartKey, quantity: item.quantity });
        }
      });
      return merged;
    });
    setIsCartOpen(true);
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
    supabaseProducts,
    isLoadingProducts,
    user,
    profile,
  };

  return (
    <Suspense fallback={<div className="productPageLoading"><span className="adminSpinner large" /></div>}>
      <Routes>
        <Route
          path="/"
          element={<Home {...cartProps} toastMessage={toastMessage} />}
        />

        <Route path="/produtos" element={<AllProducts {...cartProps} toastMessage={toastMessage} />} />
        <Route path="/produto/:id" element={<ProductPage {...cartProps} toastMessage={toastMessage} />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/cadastro" element={<CustomerRegister />} />
        <Route path="/reset-senha" element={<CustomerResetPassword />} />
        <Route path="/meus-pedidos" element={<MyOrders repeatOrderToCart={repeatOrderToCart} setIsCartOpen={setIsCartOpen} />} />
        <Route path="/promocoes" element={<Promocoes {...cartProps} toastMessage={toastMessage} />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
