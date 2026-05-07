import Header from "../components/Header.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { products } from "../data/products";
import CartDrawer from "../components/CartDrawer";
import { useState } from "react";
import ProductModal from "../components/ProductModal";
import Footer from "../components/Footer";
import Promotions from "../components/Promotions";
import HeroCarousel from "../components/HeroCarousel";

function Home({
  cartItems,
  addToCart,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  toastMessage,
  favoriteIds,
  toggleFavorite,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main>
        <HeroCarousel />

        <section id="categorias" className="categories">
          <div className="sectionTitle">
            <h2>Categorias</h2>
          </div>

          <div className="categoryGrid">
            <button
              className={selectedCategory === "Todos" ? "activeCategory" : ""}
              onClick={() => setSelectedCategory("Todos")}
            >
              ✨ Todos
            </button>

            <button
              className={selectedCategory === "Batons" ? "activeCategory" : ""}
              onClick={() => setSelectedCategory("Batons")}
            >
              💄 Batons
            </button>

            <button
              className={selectedCategory === "Bases" ? "activeCategory" : ""}
              onClick={() => setSelectedCategory("Bases")}
            >
              ✨ Bases
            </button>

            <button
              className={selectedCategory === "Paletas" ? "activeCategory" : ""}
              onClick={() => setSelectedCategory("Paletas")}
            >
              🎨 Paletas
            </button>

            <button
              className={selectedCategory === "Pincéis" ? "activeCategory" : ""}
              onClick={() => setSelectedCategory("Pincéis")}
            >
              🖌️ Pincéis
            </button>
          </div>
        </section>

        <Promotions />

        <section id="produtos" className="products">
          <div className="sectionTitle">
            <h2>Produtos em destaque</h2>
            <a href="#">Ver todos</a>
          </div>

          <div className="productGrid">
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
      />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={addToCart}
      />

      {toastMessage && <div className="toast">✅ {toastMessage}</div>}
      <Footer />
    </>
  );
}

export default Home;
