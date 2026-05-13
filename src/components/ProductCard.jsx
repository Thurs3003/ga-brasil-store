import { ShoppingCart } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

function StarRating({ rating }) {
  if (!rating) return null;
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="starRating">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= Math.floor(rounded) ? 'starFull' : n - 0.5 === rounded ? 'starHalf' : 'starEmpty'}
        >★</span>
      ))}
      <span className="ratingValue">{rating}</span>
    </div>
  );
}

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
      ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
      : null;

  const stockPercent = Math.min(Math.round((product.stock / 50) * 100), 100);
  const stockLow = product.stock <= 5;

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

        {product.featured && <div className="bestSellerBadge">🔥 Mais vendido</div>}
        {discount && <div className="discountBadge">-{discount}%</div>}
        {product.category && <div className="categoryBadge">{product.category}</div>}

        <button
          className={`favoriteButton ${isFavorite ? 'isFavorite' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="productInfo">
        <div className="productMeta">
          {product.tag && <span>{product.tag}</span>}
        </div>

        <div className="brandRow">
          <p className="brand">{product.brand}</p>
          <StarRating rating={product.rating} />
        </div>

        <h3 onClick={() => onOpenDetails(product)}>{product.name}</h3>

        <div className="prices">
          <div className="priceRow">
            {oldPrice && (
              <s className="oldPrice">R$ {Number(oldPrice).toFixed(2).replace('.', ',')}</s>
            )}
            <strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong>
          </div>
          {product.installment && <em>{product.installment}</em>}
        </div>

        <div className="stockInfo">
          <div className="stockTop">
            <span className={`stockDot ${stockLow ? 'stockLow' : ''}`} />
            <span>{stockLow ? `Restam ${product.stock} unidades!` : `Em estoque • ${product.stock} un.`}</span>
          </div>
          <div className="stockBar">
            <div
              className="stockBarFill"
              style={{ width: `${stockPercent}%`, '--stock-pct': `${stockPercent}%` }}
            />
          </div>
        </div>

        <button className="cardAddButton" onClick={() => addToCart(product)}>
          <ShoppingCart size={15} strokeWidth={2.2} />
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
