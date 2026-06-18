import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../lib/supabaseClient";
import { getSupportWA, buildWAUrl } from "../lib/whatsapp";
import { addRecentlyViewed } from "../lib/recentlyViewed";
import { useUser } from "../hooks/useUser";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="starPicker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`starPickerBtn ${n <= (hovered || value) ? "active" : ""}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >★</button>
      ))}
    </div>
  );
}

function ReviewStars({ rating }) {
  return (
    <div className="reviewStars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "starFull" : "starEmpty"}>★</span>
      ))}
    </div>
  );
}

function ProductPage({ cartItems, addToCart, isCartOpen, setIsCartOpen, increaseQuantity, decreaseQuantity, removeFromCart, favoriteIds, toggleFavorite, supabaseProducts, isLoadingProducts, user: userProp, profile: profileProp }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useUser();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [myReview, setMyReview] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculado cedo para ficar disponível nos hooks abaixo
  const allImages = product
    ? [product.image, ...(product.gallery || [])].filter((img, i, arr) => img && arr.indexOf(img) === i)
    : [];

  function navigateGallery(direction) {
    const current = selectedImage || product?.image || "";
    const idx = allImages.indexOf(current);
    const next = (idx + direction + allImages.length) % allImages.length;
    setSelectedImage(allImages[next]);
  }

  function navigateLightbox(direction) {
    const idx = allImages.indexOf(zoomedImage);
    const next = (idx + direction + allImages.length) % allImages.length;
    setZoomedImage(allImages[next]);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    function handleKey(e) {
      if (!zoomedImage) return;
      if (e.key === "Escape") { setZoomedImage(null); return; }
      if (e.key === "ArrowRight") navigateLightbox(1);
      if (e.key === "ArrowLeft")  navigateLightbox(-1);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [zoomedImage]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const found = supabaseProducts.find((p) => String(p.id) === String(id));
      if (found) {
        setProduct(found);
        setSelectedImage(found.image || "");
        setSelectedVariant("");
        addRecentlyViewed(found.id);
      } else if (!isLoadingProducts) {
        const { data } = await supabase.from("products").select("*").eq("id", id).single();
        if (data) {
          setProduct({ ...data, oldPrice: data.old_price, isNew: data.is_new });
          setSelectedImage(data.image || "");
          setSelectedVariant("");
          addRecentlyViewed(data.id);
        } else {
          navigate("/produtos");
        }
      }
      setLoading(false);
    }
    if (!isLoadingProducts) load();
  }, [id, supabaseProducts, isLoadingProducts]);

  useEffect(() => {
    async function loadReviews() {
      setReviewLoading(true);
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles(name)")
        .eq("product_id", id)
        .order("created_at", { ascending: false });
      setReviews(data || []);
      if (user && data) {
        const mine = data.find((r) => r.user_id === user.id);
        if (mine) setMyReview({ rating: mine.rating, comment: mine.comment || "" });
      }
      setReviewLoading(false);
    }
    loadReviews();
  }, [id, user]);

  async function submitReview(e) {
    e.preventDefault();
    if (!myReview.rating) { setReviewError("Selecione uma nota."); return; }
    setSubmitting(true);
    setReviewError("");
    const { error } = await supabase.from("reviews").upsert({
      product_id: Number(id),
      user_id: user.id,
      name: profile?.name || "Anônimo",
      rating: myReview.rating,
      comment: myReview.comment,
    }, { onConflict: "product_id,user_id" });
    if (error) { setReviewError("Erro ao enviar avaliação. Tente novamente."); }
    else {
      setReviewSuccess(true);
      const [{ data: reviewsData }, { data: updatedProduct }] = await Promise.all([
        supabase.from("reviews").select("*, profiles(name)").eq("product_id", id).order("created_at", { ascending: false }),
        supabase.from("products").select("rating").eq("id", id).single(),
      ]);
      setReviews(reviewsData || []);
      if (updatedProduct) setProduct((p) => ({ ...p, rating: updatedProduct.rating }));
    }
    setSubmitting(false);
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const relatedProducts = supabaseProducts
    .filter((p) => p.id !== product?.id && p.category === product?.category)
    .slice(0, 4);

  if (loading || isLoadingProducts) {
    return (
      <>
        <Header cartItems={cartItems} setIsCartOpen={setIsCartOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchResults={[]} />
        <div className="productPageLoading"><span className="adminSpinner large" /><p>Carregando produto...</p></div>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const whatsappUrl = buildWAUrl(getSupportWA(), `Olá! Tenho interesse no produto: *${product.name}*. Poderia me passar mais informações?`);
  const oldPrice = product.old_price || product.oldPrice;
  const discount = oldPrice && oldPrice > 0 ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : null;

  const productUrl = `${import.meta.env.VITE_APP_URL}/produto/${product.id}`;
  const productDesc = product.description
    ? product.description.slice(0, 155)
    : `${product.brand} — ${product.name}. Preço especial para lojistas e revendedores. R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || productDesc,
    brand: { "@type": "Brand", name: product.brand },
    image: product.image,
    url: productUrl,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BRL",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "G.A Brasil" },
    },
    ...(avgRating ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: reviews.length,
      },
    } : {}),
  };

  return (
    <>
      {zoomedImage && (
        <div className="imageLightbox" onClick={() => setZoomedImage(null)}>
          <button className="lightboxClose" onClick={() => setZoomedImage(null)}>✕</button>
          {allImages.length > 1 && (
            <button className="lightboxArrow left" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}>‹</button>
          )}
          <img src={zoomedImage} alt={product.name} onClick={(e) => e.stopPropagation()} />
          {allImages.length > 1 && (
            <button className="lightboxArrow right" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}>›</button>
          )}
        </div>
      )}
      <Helmet>
        <title>{product.name} — {product.brand} | G.A Brasil</title>
        <meta name="description" content={productDesc} />
        <meta name="keywords" content={`${product.name}, ${product.brand}, ${product.category || "maquiagem"}, cosméticos atacado, distribuidora maquiagem`} />
        <link rel="canonical" href={productUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:title" content={`${product.name} — ${product.brand} | G.A Brasil`} />
        <meta property="og:description" content={productDesc} />
        <meta property="og:image" content={product.image} />
        <meta property="og:image:alt" content={product.name} />
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="BRL" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | G.A Brasil`} />
        <meta name="twitter:description" content={productDesc} />
        <meta name="twitter:image" content={product.image} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header cartItems={cartItems} setIsCartOpen={setIsCartOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchResults={[]} />

      <main className="productPage">
        <div className="productPageInner">
          <div className="productPageNav">
            <button className="productPageBack" onClick={() => navigate(-1)}>
              ← Voltar
            </button>
            <div className="productPageBreadcrumb">
              <Link to="/">Início</Link>
              <span>›</span>
              <Link to="/produtos">Catálogo</Link>
              <span>›</span>
              <span>{product.name}</span>
            </div>
          </div>

          <div className="productPageGrid">
            {/* Gallery */}
            <div className="productPageGallery">
              <div className="productPageMainImage" onClick={() => setZoomedImage(selectedImage || product.image)}>
                {discount && <div className="productPageDiscount">-{discount}%</div>}
                <img src={selectedImage || product.image} alt={product.name} fetchpriority="high" />
                {allImages.length > 1 && (
                  <>
                    <button className="galleryArrow left" onClick={(e) => { e.stopPropagation(); navigateGallery(-1); }}>‹</button>
                    <button className="galleryArrow right" onClick={(e) => { e.stopPropagation(); navigateGallery(1); }}>›</button>
                  </>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="productPageThumbs">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      className={`productPageThumb ${selectedImage === img ? "active" : ""}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="productPageInfo">
              <div className="productPageBadges">
                {product.isNew && <span className="badgeNew">Novo</span>}
                {product.featured && <span className="badgeFeatured">🔥 Mais vendido</span>}
                {product.category && <span className="badgeCategory">{product.category}</span>}
                {product.tag && <span className="badgeTag">{product.tag}</span>}
              </div>

              <p className="productPageBrand">{product.brand}</p>
              <h1 className="productPageName">{product.name}</h1>

              {avgRating && (
                <div className="productPageRating">
                  <ReviewStars rating={Math.round(avgRating)} />
                  <span>{avgRating} ({reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""})</span>
                </div>
              )}

              <div className="productPagePrices">
                {oldPrice && <s className="productPageOldPrice">R$ {Number(oldPrice).toFixed(2).replace(".", ",")}</s>}
                <strong className="productPagePrice">R$ {Number(product.price).toFixed(2).replace(".", ",")}</strong>
                {product.installment && <em className="productPageInstallment">{product.installment}</em>}
              </div>

              {product.description && (
                <p className="productPageDesc">{product.description}</p>
              )}

              {product.variants?.options?.length > 0 && (() => {
                const opts = product.variants.options.map((o) =>
                  typeof o === "string" ? { name: o, image_url: null } : o
                );
                const hasImages = opts.some((o) => o.image_url);
                return (
                  <div className="variantSelector">
                    <div className="variantOptions">
                      {opts.map((opt) =>
                        hasImages ? (
                          <button
                            key={opt.name}
                            type="button"
                            className={`variantSwatch ${selectedVariant === opt.name ? "selected" : ""}`}
                            onClick={() => { setSelectedVariant(opt.name); setSelectedImage(opt.image_url || ""); }}
                            title={opt.name}
                          >
                            {opt.image_url
                              ? <img src={opt.image_url} alt={opt.name} className="variantSwatchImg" />
                              : <span className="variantSwatchPlaceholder">{opt.name[0]}</span>
                            }
                          </button>
                        ) : (
                          <button
                            key={opt.name}
                            type="button"
                            className={`variantOption ${selectedVariant === opt.name ? "selected" : ""}`}
                            onClick={() => { setSelectedVariant(opt.name); setSelectedImage(""); }}
                          >
                            {opt.name}
                          </button>
                        )
                      )}
                    </div>
                    {selectedVariant && (
                      <p className="variantSelectedLabel">
                        {product.variants.label}: <strong>{selectedVariant}</strong>
                      </p>
                    )}
                    {!selectedVariant && (
                      <p className="variantSelectorHint">Selecione {product.variants.label.toLowerCase()}</p>
                    )}
                  </div>
                );
              })()}

              <div className="productPageBenefits">
                <span>📦 Em estoque: {product.stock} unidades</span>
                <span>🚚 Frete calculado no carrinho</span>
                <span>💬 Atendimento pelo WhatsApp</span>
              </div>

              <div className="productPageActions">
                <button
                  className="detailsAddButton"
                  disabled={product.variants?.options?.length > 0 && !selectedVariant}
                  onClick={() => addToCart({ ...product, selectedVariant: selectedVariant || undefined })}
                >
                  🛒 Adicionar ao carrinho
                </button>
                <a className="whatsappButton" href={whatsappUrl} target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.057 23.552a.75.75 0 0 0 .921.921l5.69-1.475A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.205-1.432l-.372-.218-3.853.999 1.02-3.735-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Pedir pelo WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="productPageReviews">
            <h2>Avaliações dos clientes</h2>

            {avgRating ? (
              <div className="reviewsSummary">
                <div className="reviewsAvgBig">
                  <strong>{avgRating}</strong>
                  <ReviewStars rating={Math.round(avgRating)} />
                  <span>{reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}</span>
                </div>
              </div>
            ) : (
              !reviewLoading && <p className="reviewsEmpty">Nenhuma avaliação ainda. Seja o primeiro!</p>
            )}

            {user ? (
              <form className="reviewForm" onSubmit={submitReview}>
                <h3>{reviewSuccess ? "✅ Avaliação enviada!" : "Deixar avaliação"}</h3>
                {!reviewSuccess && (
                  <>
                    <div className="reviewFormRow">
                      <label>Sua nota</label>
                      <StarPicker value={myReview.rating} onChange={(v) => setMyReview((r) => ({ ...r, rating: v }))} />
                    </div>
                    <div className="reviewFormRow">
                      <label>Comentário (opcional)</label>
                      <textarea
                        rows={3}
                        placeholder="Conte sua experiência com este produto..."
                        value={myReview.comment}
                        onChange={(e) => setMyReview((r) => ({ ...r, comment: e.target.value }))}
                      />
                    </div>
                    {reviewError && <p className="reviewError">{reviewError}</p>}
                    <button type="submit" className="reviewSubmitBtn" disabled={submitting}>
                      {submitting ? "Enviando..." : "Enviar avaliação"}
                    </button>
                  </>
                )}
              </form>
            ) : (
              <div className="reviewLoginPrompt">
                <p>Para avaliar este produto, <Link to="/login">faça login</Link> ou <Link to="/cadastro">crie uma conta</Link>.</p>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="reviewsList">
                {reviews.map((r) => (
                  <div key={r.id} className="reviewCard">
                    <div className="reviewCardTop">
                      <div className="reviewCardLeft">
                        <div className="reviewAvatar">{(r.profiles?.name || r.name || "?")[0].toUpperCase()}</div>
                        <div>
                          <strong>{r.profiles?.name || r.name || "Anônimo"}</strong>
                          <small>{new Date(r.created_at).toLocaleDateString("pt-BR")}</small>
                        </div>
                      </div>
                      <ReviewStars rating={r.rating} />
                    </div>
                    {r.comment && <p className="reviewComment">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related */}
          {relatedProducts.length > 0 && (
            <div className="productPageRelated">
              <h2>Produtos relacionados</h2>
              <div className="productPageRelatedGrid">
                {relatedProducts.map((p) => (
                  <Link key={p.id} to={`/produto/${p.id}`} className="relatedCard">
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
                    <div className="relatedCardInfo">
                      <span>{p.brand}</span>
                      <strong>{p.name}</strong>
                      <p>R$ {Number(p.price).toFixed(2).replace(".", ",")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <CartDrawer
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeFromCart={removeFromCart}
        user={userProp}
        profile={profileProp}
      />
      <Footer />
    </>
  );
}

export default ProductPage;
