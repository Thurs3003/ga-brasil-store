import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CartDrawer from "../components/CartDrawer";
import ProductModal from "../components/ProductModal";
import Footer from "../components/Footer";

const SORT_OPTIONS = [
  { value: "default",    label: "Ordem padrão" },
  { value: "price_asc",  label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
  { value: "name_asc",   label: "Nome A–Z" },
  { value: "newest",     label: "Mais recentes" },
];

const CATEGORY_ICONS = {
  Todos: "✨",
  Batons: "💄",
  Bases: "✨",
  Paletas: "🎨",
  "Pincéis": "🖌️",
};

function AllProducts({
  cartItems,
  addToCart,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  favoriteIds,
  toggleFavorite,
  toastMessage,
  supabaseProducts,
  isLoadingProducts,
  user,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("default");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const categories = [
    "Todos",
    ...Array.from(new Set(supabaseProducts.map((p) => p.category).filter(Boolean))),
  ];

  const countByCategory = supabaseProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const allPrices = supabaseProducts.map((p) => p.price);
  const catalogMinPrice = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0;
  const catalogMaxPrice = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 9999;
  const hasActiveFilters = priceMin !== "" || priceMax !== "" || selectedCategory !== "Todos";

  const filtered = supabaseProducts
    .filter((p) => {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s);
      const matchCat =
        selectedCategory === "Todos" || p.category === selectedCategory;
      const matchMin = priceMin === "" || p.price >= parseFloat(priceMin);
      const matchMax = priceMax === "" || p.price <= parseFloat(priceMax);
      return matchSearch && matchCat && matchMin && matchMax;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name, "pt-BR");
      if (sortBy === "newest") return (b.id || 0) - (a.id || 0);
      return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
    });

  const categoryLabel = selectedCategory !== "Todos" ? ` — ${selectedCategory}` : "";
  const pageTitle = `Catálogo${categoryLabel} | G.A Brasil`;
  const pageDesc = selectedCategory !== "Todos"
    ? `Explore nossa linha de ${selectedCategory} com os melhores preços para lojistas e revendedores.`
    : "Catálogo completo de maquiagens e cosméticos. Batons, bases, paletas, pincéis e muito mais com preços especiais de atacado.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={`catálogo maquiagem, ${selectedCategory !== "Todos" ? selectedCategory + ", " : ""}distribuidora cosméticos, atacado beleza`} />
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

        <div className="catalogBody">
          <div className="catalogInlineHeader">
            <Link to="/" className="catalogBackLink">← Voltar para a loja</Link>
            <h1>Catálogo completo</h1>
            {!isLoadingProducts && (
              <p className="catalogSubtitle">
                {supabaseProducts.length} produtos &middot;&nbsp;
                {new Set(supabaseProducts.map((p) => p.category).filter(Boolean)).size} categorias &middot;&nbsp;
                {new Set(supabaseProducts.map((p) => p.brand).filter(Boolean)).size} marcas
              </p>
            )}
          </div>

          <div className="catalogControls">
            <div className="catalogCategories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={selectedCategory === cat ? "activeCategory" : ""}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span className="catIcon">{CATEGORY_ICONS[cat] ?? "🏷️"}</span>
                  <span>{cat}</span>
                  <span className="catCount">
                    {cat === "Todos" ? supabaseProducts.length : (countByCategory[cat] ?? 0)}
                  </span>
                </button>
              ))}
            </div>

            <div className="catalogRightControls">
              <div className="catalogPriceFilter">
                <span>R$</span>
                <input
                  type="number" min={catalogMinPrice} max={catalogMaxPrice}
                  placeholder={catalogMinPrice}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <span className="priceSep">–</span>
                <input
                  type="number" min={catalogMinPrice} max={catalogMaxPrice}
                  placeholder={catalogMaxPrice}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>

              <div className="catalogSort">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  className="catalogClearBtn"
                  onClick={() => { setSelectedCategory("Todos"); setPriceMin(""); setPriceMax(""); }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {!isLoadingProducts && filtered.length === 0 ? (
            <div className="emptySearch">
              <h3>Nenhum produto encontrado</h3>
              <p>Tente buscar por outro nome ou categoria.</p>
            </div>
          ) : (
            <div className="productGrid">
              {isLoadingProducts
                ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : filtered.map((product) => (
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

          {!isLoadingProducts && filtered.length > 0 && (
            <p className="catalogCount">
              Exibindo <strong>{filtered.length}</strong> de <strong>{supabaseProducts.length}</strong> produtos
            </p>
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
        user={user}
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
