function ProductCard({
  product,
  addToCart,
  onOpenDetails,
  favoriteIds,
  toggleFavorite,
}) {
  const isFavorite = favoriteIds.includes(product.id);

  return (
    <div className="productCard">
      <div className="productImage">
        <img
          src={product.image}
          alt={product.name}
          onClick={() => onOpenDetails(product)}
        />

        <span className="discountBadge">-{product.discount}%</span>

        <button
          className={`favoriteButton ${isFavorite ? "isFavorite" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(product.id);
          }}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <div className="overlay">
          <button onClick={() => addToCart(product)}>
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <div className="productInfo">
        <div className="productMeta">
          <span>{product.tag}</span>
          <small>⭐ {product.rating}</small>
        </div>

        <p className="brand">{product.brand}</p>

        <h3 onClick={() => onOpenDetails(product)}>{product.name}</h3>

        <div className="prices">
          <small>R$ {product.oldPrice.toFixed(2).replace(".", ",")}</small>
          <strong>R$ {product.price.toFixed(2).replace(".", ",")}</strong>
          <em>{product.installment}</em>
        </div>

        <p className="stockInfo">Em estoque • {product.stock} unidades</p>
      </div>
    </div>
  );
}

export default ProductCard;