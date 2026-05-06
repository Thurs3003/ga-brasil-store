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
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <Header cartItems={cartItems} setIsCartOpen={setIsCartOpen} />

      <main>
        <section className="products">
          <div className="sectionTitle">
            <h2>Produtos em destaque</h2>
            <a href="#">Ver todos</a>
          </div>

          <div className="productGrid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                onOpenDetails={setSelectedProduct}
              />
            ))}
          </div>
        </section>
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
          <h2>Categorias</h2>

          <div className="categoryGrid">
            <div>💄 Batons</div>
            <div>✨ Bases</div>
            <div>🎨 Paletas</div>
            <div>🖌️ Pincéis</div>
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
    </>
  );
}

export default Home;
