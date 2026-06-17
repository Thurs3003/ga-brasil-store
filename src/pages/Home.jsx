import { Helmet } from "react-helmet-async";
import Header from "../components/Header.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import CartDrawer from "../components/CartDrawer";
import { useState } from "react";
import { Link } from "react-router-dom";
import ProductModal from "../components/ProductModal";
import Footer from "../components/Footer";
import Promotions from "../components/Promotions";
import HeroCarousel from "../components/HeroCarousel";
import SocialProof from "../components/SocialProof";
import Brands from "../components/Brands";
import BestSellers from "../components/BestSellers";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { useScrollReveal } from "../hooks/useScrollReveal";
import FAQ from "../components/FAQ";
import { getRecentlyViewedIds } from "../lib/recentlyViewed";

function Home({
  cartItems,
  addToCart,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  favoriteIds,
  toggleFavorite,
  toastMessage,
  supabaseProducts,
  isLoadingProducts,
  user,
  profile,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const productsTitleRef = useScrollReveal();

  const productsToShow = supabaseProducts;

  const recentIds = getRecentlyViewedIds();
  const recentProducts = recentIds.map((id) => productsToShow.find((p) => p.id === id)).filter(Boolean);

  const filteredProducts = productsToShow.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search) ||
      (product.category && product.category.toLowerCase().includes(search))
    );
  });

  const favoriteProducts = productsToShow.filter((product) =>
    favoriteIds.includes(product.id),
  );

  return (
    <>
      <Helmet>
        <title>G.A Brasil | Distribuidora de Maquiagens e Cosméticos</title>
        <meta name="description" content="Distribuidora de maquiagens e acessórios para lojistas e revendedores. Batons, bases, paletas, pincéis e muito mais com preços especiais de atacado." />
        <meta name="keywords" content="maquiagem atacado, distribuidora maquiagem, cosméticos lojistas, revendedores maquiagem, batons, bases, paletas" />
        <link rel="canonical" href={`${import.meta.env.VITE_APP_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${import.meta.env.VITE_APP_URL}/`} />
        <meta property="og:title" content="G.A Brasil | Distribuidora de Maquiagens e Cosméticos" />
        <meta property="og:description" content="Distribuidora de maquiagens e acessórios para lojistas e revendedores. Preços especiais de atacado." />
        <meta property="og:image" content={`${import.meta.env.VITE_APP_URL}/preview.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="G.A Brasil | Distribuidora de Maquiagens" />
        <meta name="twitter:description" content="Distribuidora de maquiagens e acessórios para lojistas e revendedores." />
        <meta name="twitter:image" content={`${import.meta.env.VITE_APP_URL}/preview.png`} />
      </Helmet>
      <Header
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={filteredProducts}
      />

      <main>
        <HeroCarousel />

        <SocialProof />

        <BestSellers
          products={productsToShow}
          addToCart={addToCart}
          setSelectedProduct={setSelectedProduct}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />
        <Promotions products={productsToShow} />

        <Brands />

        {favoriteProducts.length > 0 && (
          <section className="favoritesSection">
            <div className="sectionTitle">
              <h2>Produtos salvos para você</h2>
              <a href="#produtos">Ver catálogo</a>
            </div>

            <div className="productGrid">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  onOpenDetails={setSelectedProduct}
                  favoriteIds={favoriteIds}
                  toggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {recentProducts.length > 0 && (
          <section className="favoritesSection">
            <div className="sectionTitle">
              <h2>Vistos recentemente</h2>
              <Link to="/produtos">Ver catálogo</Link>
            </div>
            <div className="productGrid">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                  onOpenDetails={setSelectedProduct}
                  favoriteIds={favoriteIds}
                  toggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        <FeaturedCarousel
          products={productsToShow}
          addToCart={addToCart}
          setSelectedProduct={setSelectedProduct}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
          isLoading={isLoadingProducts}
        />
      </main>

      <CartDrawer
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeFromCart={removeFromCart}
        user={user}
        profile={profile}
      />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={addToCart}
      />

      {toastMessage && <div className="toast">✅ {toastMessage}</div>}
      <FAQ />
      <Footer />
    </>
  );
}

export default Home;
