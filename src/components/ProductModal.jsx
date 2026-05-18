import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSupportWA, buildWAUrl } from "../lib/whatsapp";
import { addRecentlyViewed } from "../lib/recentlyViewed";

function StarRating({ rating }) {
  if (!rating) return null;
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="starRating">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={
            n <= Math.floor(rounded)
              ? "starFull"
              : n - 0.5 === rounded
              ? "starHalf"
              : "starEmpty"
          }
        >
          ★
        </span>
      ))}
      <span className="ratingValue">{rating}</span>
    </div>
  );
}

function ProductModal({ product, onClose, addToCart }) {
  const [selectedImage, setSelectedImage] = useState("");
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    setSelectedImage(product?.image || "");
    setIsDescExpanded(false);
    setZoomedImage(null);
    if (product) addRecentlyViewed(product.id);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    function handleKey(e) {
      if (e.key === "Escape") {
        if (zoomedImage) { setZoomedImage(null); return; }
        onClose();
      }
      if (e.key === "ArrowRight") navigateGallery(1);
      if (e.key === "ArrowLeft") navigateGallery(-1);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [product, onClose, zoomedImage]);

  if (!product) return null;

  const currentImage = selectedImage || product.image;

  const allImages = [product.image, ...(product.gallery || [])].filter(
    (img, i, arr) => img && arr.indexOf(img) === i
  );

  const currentIndex = allImages.indexOf(currentImage);

  function navigateGallery(direction) {
    if (allImages.length <= 1) return;
    const nextIndex = (currentIndex + direction + allImages.length) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  }

  const whatsappUrl = buildWAUrl(
    getSupportWA(),
    `Olá! Tenho interesse no produto: *${product.name}*. Poderia me passar mais informações?`
  );

  const descLimit = 180;
  const isLongDesc = product.description && product.description.length > descLimit;
  const descText =
    isLongDesc && !isDescExpanded
      ? product.description.slice(0, descLimit) + "..."
      : product.description;

  return (
    <>
    {zoomedImage && (
      <div className="imageLightbox" onClick={() => setZoomedImage(null)}>
        <button className="lightboxClose" onClick={() => setZoomedImage(null)}>✕</button>
        {allImages.length > 1 && (
          <button className="lightboxArrow left" onClick={(e) => { e.stopPropagation(); const i = (allImages.indexOf(zoomedImage) - 1 + allImages.length) % allImages.length; setZoomedImage(allImages[i]); }}>‹</button>
        )}
        <img src={zoomedImage} alt={product.name} onClick={(e) => e.stopPropagation()} />
        {allImages.length > 1 && (
          <button className="lightboxArrow right" onClick={(e) => { e.stopPropagation(); const i = (allImages.indexOf(zoomedImage) + 1) % allImages.length; setZoomedImage(allImages[i]); }}>›</button>
        )}
      </div>
    )}
    <div className="productModalBackdrop" onClick={onClose}>
      <div className="productModal" onClick={(e) => e.stopPropagation()}>
        <button className="modalCloseButton" onClick={onClose}>✕</button>

        <div className="modalGallery">
          <div className="modalImage" onClick={() => setZoomedImage(currentImage)}>
            <img src={currentImage} alt={product.name} />
            {allImages.length > 1 && (
              <>
                <button className="galleryArrow left" onClick={(e) => { e.stopPropagation(); navigateGallery(-1); }}>‹</button>
                <button className="galleryArrow right" onClick={(e) => { e.stopPropagation(); navigateGallery(1); }}>›</button>
              </>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="modalThumbnails">
              {allImages.map((image, index) => (
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
            {product.isNew && <span className="badgeNew">Novo</span>}
            {product.featured && <span className="badgeFeatured">🔥 Mais vendido</span>}
            {product.category && <span className="badgeCategory">{product.category}</span>}
          </div>

          <span className="detailsBrand">{product.brand}</span>

          <h2>{product.name}</h2>
          <Link to={`/produto/${product.id}`} className="modalPageLink" onClick={onClose}>Ver página completa →</Link>

          <div className="modalRating">
            <StarRating rating={product.rating} />
            {product.reviews && <small>({product.reviews} avaliações)</small>}
          </div>

          <div className="modalDescription">
            <p>{descText}</p>
            {isLongDesc && (
              <button
                className="descToggle"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
              >
                {isDescExpanded ? "Ver menos ↑" : "Ver mais ↓"}
              </button>
            )}
          </div>

          {product.tags?.length > 0 && (
            <div className="modalTags">
              {product.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}

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

          <div className="modalActions">
            <button
              className="detailsAddButton"
              onClick={() => {
                addToCart(product);
                onClose();
              }}
            >
              🛒 Adicionar ao carrinho
            </button>

            <a
              className="whatsappButton"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.057 23.552a.75.75 0 0 0 .921.921l5.69-1.475A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.205-1.432l-.372-.218-3.853.999 1.02-3.735-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Pedir pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductModal;
