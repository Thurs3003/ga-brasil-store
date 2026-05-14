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
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categoriesRef = useScrollReveal();
  const productsTitleRef = useScrollReveal();

  const productsToShow = supabaseProducts;

  const recentIds = getRecentlyViewedIds();
  const recentProducts = recentIds.map((id) => productsToShow.find((p) => p.id === id)).filter(Boolean);

  const categories = [
    "Todos",
    ...Array.from(new Set(productsToShow.map((p) => p.category).filter(Boolean))),
  ];

  const categoryIcons = {
    Todos: "✨",
    Batons: "💄",
    Bases: "✨",
    Paletas: "🎨",
    "Pincéis": "🖌️",
  };

  const countByCategory = productsToShow.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const filteredProducts = productsToShow.filter((product) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
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
        onOpenProduct={setSelectedProduct}
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
        <Promotions />

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

        <section ref={categoriesRef} id="categorias" className="categories reveal">
          <div className="sectionTitle">
            <h2>Categorias</h2>
          </div>

          <div className="categoryGrid">
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "activeCategory" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                <span className="catIcon">{categoryIcons[cat] ?? "🏷️"}</span>
                <span>{cat}</span>
                <span className="catCount">
                  {cat === "Todos" ? productsToShow.length : (countByCategory[cat] ?? 0)}
                </span>
              </button>
            ))}
          </div>
        </section>

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

        <section id="produtos" className="products">
          <div className="sectionTitle">
            <h2>Produtos em destaque</h2>
            <Link to="/produtos">Ver todos</Link>
          </div>

          <div className="productGrid">
            {isLoadingProducts ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              <>
                {filteredProducts.length === 0 && (
                  <div className="emptySearch">
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente buscar por outro nome ou marca.</p>
                  </div>
                )}
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    onOpenDetails={setSelectedProduct}
                    favoriteIds={favoriteIds}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </>
            )}
          </div>
        </section>
      </main>

      <CartDrawer
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeFromCart={removeFromCart}
        user={user}
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
