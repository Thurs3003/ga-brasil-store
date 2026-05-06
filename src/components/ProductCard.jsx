import { Link } from "react-router-dom";

function ProductCard({ product, addToCart }) {
  return (
    <div className="productCard">
      <div className="productImage">
        <img src={product.image} alt={product.name} />

        <span className="badge">Oferta</span>

        <div className="overlay">
          <button onClick={() => addToCart(product)}>
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <div className="productInfo">
        <p className="brand">{product.brand}</p>
        <Link to={`/produto/${product.id}`} className="productLink">
          <h3>{product.name}</h3>
        </Link>

        <div className="prices">
          <small>R$ {product.oldPrice.toFixed(2)}</small>
          <strong>R$ {product.price.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
