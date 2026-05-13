import { useScrollReveal } from '../hooks/useScrollReveal';
import ProductCard from "./ProductCard";

function BestSellers({
  products,
  addToCart,
  setSelectedProduct,
  favoriteIds,
  toggleFavorite,
}) {
  const titleRef = useScrollReveal();
  const bestSellers = products.slice(0, 4);

  return (
    <section className="bestSellersSection">
      <div ref={titleRef} className="sectionTitle reveal">
        <div>
          <span className="sectionEyebrow">Destaques da loja</span>
          <h2>Mais vendidos</h2>
        </div>

        <a href="#produtos">Ver catálogo</a>
      </div>

      <div className="productGrid">
        {bestSellers.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            onOpenDetails={setSelectedProduct}
            favoriteIds={favoriteIds}
            toggleFavorite={toggleFavorite}
            revealDelay={index * 0.12}
          />
        ))}
      </div>
    </section>
  );
}

export default BestSellers;
