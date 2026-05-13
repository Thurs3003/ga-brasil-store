import { useScrollReveal } from '../hooks/useScrollReveal';

function ProductCard({
  product,
  addToCart,
  onOpenDetails,
  favoriteIds,
  toggleFavorite,
  revealDelay = 0,
}) {
  const isFavorite = favoriteIds.includes(product.id);
  const ref = useScrollReveal();

  const oldPrice = product.old_price || product.oldPrice;

  const discount =
    oldPrice && oldPrice > 0
      ? Math.round(
          ((oldPrice - product.price) / oldPrice) * 100,
        )
      : null;

  return (
    <div
      ref={ref}
      className="productCard reveal"
      style={revealDelay ? { '--reveal-delay': `${revealDelay}s` } : undefined}
    >
      <div className="productImage">
        <img
          src={product.image}
          alt={product.name}
          onClick={() => onOpenDetails(product)}
        />

        {discount && <div className="discountBadge">-{discount}%</div>}

        <button
          className={`favoriteButton ${isFavorite ? "isFavorite" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(product.id);
          }}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

      </div>

      <div className="productInfo">
        <div className="productMeta">
          {product.tag && <span>{product.tag}</span>}
          <small>⭐ {product.rating}</small>
        </div>

        <p className="brand">{product.brand}</p>

        <h3 onClick={() => onOpenDetails(product)}>{product.name}</h3>

        <div className="prices">
          {product.old_price && (
            <small>R$ {Number(product.old_price).toFixed(2)}</small>
          )}
          <strong>R$ {product.price.toFixed(2).replace(".", ",")}</strong>
          <em>{product.installment}</em>
        </div>

        <p className="stockInfo">Em estoque • {product.stock} unidades</p>

        <button className="cardAddButton" onClick={() => addToCart(product)}>
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
