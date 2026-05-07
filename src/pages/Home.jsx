import Header from "../components/Header.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { products } from "../data/products";
import CartDrawer from "../components/CartDrawer";
import { useState } from "react";
import ProductModal from "../components/ProductModal";

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
        <section className="hero">
          <div className="heroText">
            <span>Distribuidora de Maquiagens</span>
            <h1>Produtos de beleza para quem compra e revende</h1>
            <p>
              Encontre maquiagens, acessórios e kits promocionais com preços
              especiais para lojistas e revendedoras.
            </p>

            <div className="heroButtons">
              <button>Ver produtos</button>
              <button className="outline"> Falar no WhatsApp</button>
            </div>
          </div>

          <div className="heroCard">
            <h2>Promoção da Semana</h2>
            <p>Kits selecionados com descontos especiais</p>
            <strong>até 30% OFF</strong>
          </div>
        </section>

        <section className="categories">
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
        <section className="products">
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
    </>
  );
}

export default Home;
