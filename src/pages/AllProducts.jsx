import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSetting, subscribeToSettings } from "../lib/settings";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CartDrawer from "../components/CartDrawer";
import ProductModal from "../components/ProductModal";
import Footer from "../components/Footer";

const PRODUCTS_PER_PAGE = 20;
const DEFAULT_CAT_EMOJI = "🏷️";
const SORT_OPTIONS = [
  { value: "default",    label: "Ordem padrão" },
  { value: "price_asc",  label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
  { value: "name_asc",   label: "Nome A–Z" },
  { value: "newest",     label: "Mais recentes" },
];

function AllProducts({
  cartItems, addToCart, isCartOpen, setIsCartOpen,
  increaseQuantity, decreaseQuantity, removeFromCart,
  favoriteIds, toggleFavorite, toastMessage,
  supabaseProducts, isLoadingProducts, user, profile,
}) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [catIconsMap, setCatIconsMap] = useState(() => getSetting("category_icons", {}));
  useEffect(() => subscribeToSettings((s) => setCatIconsMap(s.category_icons || {})), []);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("default");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Price range slider state
  const [rangeMin, setRangeMin] = useState(0);
  const [rangeMax, setRangeMax] = useState(99999);
  const [rangeReady, setRangeReady] = useState(false);

  const allPrices = supabaseProducts.map((p) => p.price);
  const catalogMinPrice = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0;
  const catalogMaxPrice = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 99999;

  // Initialize slider when products load
  useEffect(() => {
    if (supabaseProducts.length > 0 && !rangeReady) {
      setRangeMin(catalogMinPrice);
      setRangeMax(catalogMaxPrice);
      setRangeReady(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseProducts.length]);

  // Reset page when any filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, stockFilter, rangeMin, rangeMax, searchTerm, sortBy]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = filterDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterDrawerOpen]);

  const categories = [
    "Todos",
    ...Array.from(new Set(supabaseProducts.map((p) => p.category).filter(Boolean))),
  ];

  const countByCategory = supabaseProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const hasActiveFilters =
    selectedCategory !== "Todos" ||
    stockFilter !== "all" ||
    (rangeReady && (rangeMin > catalogMinPrice || rangeMax < catalogMaxPrice));

  function clearFilters() {
    setSelectedCategory("Todos");
    setStockFilter("all");
    setRangeMin(catalogMinPrice);
    setRangeMax(catalogMaxPrice);
  }

  const filtered = supabaseProducts
    .filter((p) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        (p.category && p.category.toLowerCase().includes(s));
      const matchCat = selectedCategory === "Todos" || p.category === selectedCategory;
      const matchMin = !rangeReady || p.price >= rangeMin;
      const matchMax = !rangeReady || p.price <= rangeMax;
      const matchStock = stockFilter === "all" || p.stock > 0;
      return matchSearch && matchCat && matchMin && matchMax && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name, "pt-BR");
      if (sortBy === "newest") return (b.id || 0) - (a.id || 0);
      return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
    });

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  function goToPage(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getPageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (currentPage >= totalPages - 3)
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages];
  }

  const rangeSpan = Math.max(catalogMaxPrice - catalogMinPrice, 1);
  const pctMin = ((rangeMin - catalogMinPrice) / rangeSpan) * 100;
  const pctMax = ((rangeMax - catalogMinPrice) / rangeSpan) * 100;

  const sidebarContent = (
    <div className="catalogSidebarInner">
      <div className="sidebarSection">
        <h3 className="sidebarSectionTitle">Categoria</h3>
        <div className="sidebarCatList">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`sidebarCatPill${selectedCategory === cat ? " active" : ""}`}
              onClick={() => { setSelectedCategory(cat); setFilterDrawerOpen(false); }}
            >
              <span className="sidebarCatPillLabel">
                <span>{catIconsMap[cat] || DEFAULT_CAT_EMOJI}</span>
                <span>{cat}</span>
              </span>
              <span className="sidebarCatCount">
                {cat === "Todos" ? supabaseProducts.length : (countByCategory[cat] ?? 0)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {rangeReady && catalogMaxPrice > catalogMinPrice && (
        <div className="sidebarSection">
          <h3 className="sidebarSectionTitle">Faixa de preço</h3>
          <div className="dualRangeWrapper">
            <div className="dualRangeTrack">
              <div
                className="dualRangeHighlight"
                style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
              />
            </div>
            <input
              type="range"
              className="rangeInput"
              min={catalogMinPrice}
              max={catalogMaxPrice}
              value={rangeMin}
              onChange={(e) => setRangeMin(Math.min(+e.target.value, rangeMax - 1))}
            />
            <input
              type="range"
              className="rangeInput"
              min={catalogMinPrice}
              max={catalogMaxPrice}
              value={rangeMax}
              onChange={(e) => setRangeMax(Math.max(+e.target.value, rangeMin + 1))}
            />
          </div>
          <div className="priceRangeLabels">
            <span>R$ {rangeMin.toFixed(2).replace(".", ",")}</span>
            <span>R$ {rangeMax.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      )}

      <div className="sidebarSection">
        <h3 className="sidebarSectionTitle">Disponibilidade</h3>
        <div className="sidebarRadioGroup">
          {[{ v: "all", label: "Todos" }, { v: "in_stock", label: "Em estoque" }].map(({ v, label }) => (
            <label
              key={v}
              className={`sidebarRadioLabel${stockFilter === v ? " active" : ""}`}
              onClick={() => setStockFilter(v)}
            >
              {label}
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button className="sidebarClearBtn" onClick={clearFilters}>
          Limpar filtros
        </button>
      )}
    </div>
  );

  const pageTitle = `Catálogo | G.A Brasil`;
  const pageDesc = "Catálogo completo de maquiagens e cosméticos. Batons, bases, paletas, pincéis e muito mais com preços especiais de atacado.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content="catálogo maquiagem, distribuidora cosméticos, atacado beleza" />
        <link rel="canonical" href={`${import.meta.env.VITE_APP_URL}/produtos`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${import.meta.env.VITE_APP_URL}/produtos`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={`${import.meta.env.VITE_APP_URL}/preview.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Helmet>

      <Header
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={filtered}
      />

      <main className="catalogPage">
        <div className="catalogPageInner">

          {/* Mobile bar: filter button + sort */}
          <div className="catalogMobileBar">
            <button
              className="catalogMobileFilterBtn"
              onClick={() => setFilterDrawerOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="20" y2="12" />
                <line x1="12" y1="18" x2="20" y2="18" />
              </svg>
              Filtros
              {hasActiveFilters && <span className="catalogFilterBadge" />}
            </button>
            <select
              className="catalogSortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="catalogLayout">
            {/* Desktop sidebar */}
            <aside className="catalogSidebar">
              {sidebarContent}
            </aside>

            {/* Mobile drawer */}
            {filterDrawerOpen && (
              <>
                <div className="catalogDrawerBackdrop" onClick={() => setFilterDrawerOpen(false)} />
                <div className="catalogDrawer">
                  <div className="catalogDrawerHeader">
                    <span>Filtros</span>
                    <button onClick={() => setFilterDrawerOpen(false)}>✕</button>
                  </div>
                  {sidebarContent}
                </div>
              </>
            )}

            {/* Content area */}
            <div className="catalogContent">
              <div className="catalogContentHeader">
                <div className="catalogContentTitle">
                  <Link to="/" className="catalogBackLink">← Voltar para a loja</Link>
                  <h1 className="catalogTitle">Catálogo</h1>
                  <p className="catalogSubtitle">
                    {isLoadingProducts
                      ? "Carregando produtos…"
                      : `${filtered.length} produto${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <select
                  className="catalogSortSelect catalogSortDesktop"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {!isLoadingProducts && filtered.length === 0 ? (
                <div className="emptySearch">
                  <h3>Nenhum produto encontrado</h3>
                  <p>Tente ajustar os filtros ou buscar por outro termo.</p>
                </div>
              ) : (
                <div className="productGrid catalogGrid">
                  {isLoadingProducts
                    ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : paginatedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          addToCart={addToCart}
                          onOpenDetails={setSelectedProduct}
                          favoriteIds={favoriteIds}
                          toggleFavorite={toggleFavorite}
                        />
                      ))}
                </div>
              )}

              {!isLoadingProducts && totalPages > 1 && (
                <div className="catalogPagination">
                  <p className="catalogPageInfo">
                    Exibindo{" "}
                    <strong>{(currentPage - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(currentPage * PRODUCTS_PER_PAGE, filtered.length)}</strong>
                    {" "}de <strong>{filtered.length}</strong> produtos
                  </p>
                  <div className="paginationControls">
                    <button
                      className="paginationBtn"
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      ←
                    </button>
                    {getPageNumbers().map((n, i) =>
                      n === "…" ? (
                        <span key={`ell-${i}`} className="paginationEllipsis">…</span>
                      ) : (
                        <button
                          key={n}
                          className={`paginationBtn${n === currentPage ? " active" : ""}`}
                          onClick={() => goToPage(n)}
                        >
                          {n}
                        </button>
                      )
                    )}
                    <button
                      className="paginationBtn"
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}

              {!isLoadingProducts && filtered.length > 0 && totalPages <= 1 && (
                <p className="catalogCount">
                  Exibindo <strong>{filtered.length}</strong> de <strong>{supabaseProducts.length}</strong> produtos
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <CartDrawer
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeFromCart={removeFromCart}
        user={user}
        profile={profile}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={addToCart}
      />

      {toastMessage && <div className="toast">✅ {toastMessage}</div>}
      <Footer />
    </>
  );
}

export default AllProducts;
