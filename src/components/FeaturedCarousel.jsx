import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { useScrollReveal } from "../hooks/useScrollReveal";

const FEATURED_LIMIT = 16;

function FeaturedCarousel({
  products,
  addToCart,
  setSelectedProduct,
  favoriteIds,
  toggleFavorite,
  isLoading,
}) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const titleRef = useScrollReveal();

  const pinned = products.filter((p) => p.featured);
  const pinnedIds = new Set(pinned.map((p) => p.id));
  const byRating = products
    .filter((p) => !pinnedIds.has(p.id) && p.rating > 0)
    .sort((a, b) => b.rating - a.rating || b.id - a.id);
  const featured = [...pinned, ...byRating].slice(0, FEATURED_LIMIT);

  useEffect(() => {
    checkScrollState();
  }, [featured.length]);

  function checkScrollState() {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  function scroll(dir) {
    const el = trackRef.current;
    if (!el) return;
    const item = el.querySelector(".carouselItem");
    const gap = 22;
    const itemW = item ? item.offsetWidth + gap : el.clientWidth;
    el.scrollBy({ left: dir * itemW * 4, behavior: "smooth" });
  }

  return (
    <section id="produtos" className="products">
      <div ref={titleRef} className="sectionTitle reveal">
        <h2>Produtos em destaque</h2>
        <Link to="/produtos">Ver todos</Link>
      </div>

      <div className="featuredCarouselWrapper">
        <button
          className={`carouselArrow carouselArrowPrev${canPrev ? " visible" : ""}`}
          onClick={() => scroll(-1)}
          aria-label="Produtos anteriores"
        >
          ‹
        </button>

        <div
          ref={trackRef}
          className="carouselTrack"
          onScroll={checkScrollState}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="carouselItem">
                  <ProductCardSkeleton />
                </div>
              ))
            : featured.map((product) => (
                <div key={product.id} className="carouselItem">
                  <ProductCard
                    product={product}
                    addToCart={addToCart}
                    onOpenDetails={setSelectedProduct}
                    favoriteIds={favoriteIds}
                    toggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
        </div>

        <button
          className={`carouselArrow carouselArrowNext${canNext ? " visible" : ""}`}
          onClick={() => scroll(1)}
          aria-label="Próximos produtos"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default FeaturedCarousel;
