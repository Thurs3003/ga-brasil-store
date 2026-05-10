import ProductCard from "./ProductCard";
import { products } from "../data/products";

function BestSellers({
  addToCart,
  setSelectedProduct,
  favoriteIds,
  toggleFavorite,
}) {
  const bestSellers = products.filter((product) => product.featured);

  return (
    <section className="bestSellersSection">
      <div className="sectionTitle">
        <div>
          <span className="sectionEyebrow">Destaques da loja</span>
          <h2>Mais vendidos</h2>
        </div>

        <a href="#produtos">Ver catálogo</a>
      </div>

      <div className="productGrid">
        {bestSellers.map((product) => (
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
  );
}

export default BestSellers;