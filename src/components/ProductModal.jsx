function ProductModal({ product, onClose, addToCart }) {
  if (!product) return null;

  return (
    <div className="productModalBackdrop" onClick={onClose}>
      <div className="productModal" onClick={(event) => event.stopPropagation()}>
        <button className="modalCloseButton" onClick={onClose}>
          ✕
        </button>

        <div className="modalImage">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="modalInfo">
          <span className="detailsBrand">{product.brand}</span>
          <h2>{product.name}</h2>

          <p>
            Produto ideal para revendedoras, lojistas e clientes que buscam
            qualidade com preço competitivo.
          </p>

          <div className="detailsPrice">
            <small>R$ {product.oldPrice.toFixed(2).replace(".", ",")}</small>
            <strong>R$ {product.price.toFixed(2).replace(".", ",")}</strong>
          </div>

          <div className="detailsBenefits">
            <span>✅ Produto disponível</span>
            <span>📦 Ideal para revenda</span>
            <span>💬 Pedido rápido pelo WhatsApp</span>
          </div>

          <button
            className="detailsAddButton"
            onClick={() => addToCart(product)}
          >
            Adicionar ao carrinho 🛒
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;