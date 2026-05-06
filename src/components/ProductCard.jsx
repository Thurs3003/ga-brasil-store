function ProductCard({ product, addToCart, onOpenDetails }) {
  return (
    <div className="productCard">
      <div className="productImage">
        <img
          src={product.image}
          alt={product.name}
          onClick={() => onOpenDetails(product)}
        />

        <span className="badge">Oferta</span>

        <div className="overlay">
          <button onClick={() => addToCart(product)}>
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <div className="productInfo">
        <p className="brand">{product.brand}</p>

        <h3 onClick={() => onOpenDetails(product)}>
          {product.name}
        </h3>

        <div className="prices">
          <small>R$ {product.oldPrice.toFixed(2)}</small>
          <strong>R$ {product.price.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;