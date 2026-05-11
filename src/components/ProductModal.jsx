import { useState, useEffect } from "react";

function ProductModal({ product, onClose, addToCart }) {
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image || "");
    }
  }, [product]);

  if (!product) return null;

  const currentImage = selectedImage || product.image;

  return (
    <div className="productModalBackdrop" onClick={onClose}>
      <div
        className="productModal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modalCloseButton" onClick={onClose}>
          ✕
        </button>

        <div className="modalGallery">
          <div className="modalImage">
            <img src={currentImage} alt={product.name} />
          </div>

          {product.gallery && (
            <div className="modalThumbnails">
              {[product.image, ...product.gallery].map((image, index) => (
                <button
                  key={index}
                  className={currentImage === image ? "activeThumb" : ""}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modalInfo">
          <div className="modalBadges">
            {product.isNew && <span>Novo</span>}
            {product.featured && <span>Mais vendido</span>}
          </div>

          <span className="detailsBrand">{product.brand}</span>

          <h2>{product.name}</h2>

          <div className="modalRating">
            <strong>⭐ {product.rating}</strong>
            <small>({product.reviews} avaliações)</small>
          </div>

          <p>{product.description}</p>

          <div className="modalTags">
            {product.tags?.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>

          <div className="detailsPrice">
            {product.oldPrice && (
              <small>
                R$ {Number(product.oldPrice).toFixed(2).replace(".", ",")}
              </small>
            )}
            <strong>
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </strong>
            <em>{product.installment}</em>
          </div>

          <div className="detailsBenefits">
            <span>✅ Em estoque: {product.stock} unidades</span>
            <span>📦 Ideal para revenda</span>
            <span>💬 Pedido rápido pelo WhatsApp</span>
          </div>

          <button
            className="detailsAddButton"
            onClick={() => {
              addToCart(product);
              onClose();
            }}
          >
            Adicionar ao carrinho 🛒
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
