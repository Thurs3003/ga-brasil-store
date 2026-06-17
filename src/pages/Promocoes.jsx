import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CartDrawer from "../components/CartDrawer";
import ProductModal from "../components/ProductModal";
import Footer from "../components/Footer";
import { getSetting } from "../lib/settings";

function getWeekEnd() {
  const now = new Date();
  const daysUntilSunday = now.getDay() === 0 ? 7 : 7 - now.getDay();
  const end = new Date(now);
  end.setDate(now.getDate() + daysUntilSunday);
  end.setHours(23, 59, 59, 0);
  return end;
}

function getCountdownTarget() {
  const endSetting = getSetting("promotions_end");
  if (endSetting) {
    const [y, m, d] = endSetting.split("-").map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 0).getTime();
  }
  return getWeekEnd().getTime();
}

function getEndLabel() {
  const endSetting = getSetting("promotions_end");
  if (!endSetting) return "domingo";
  const [y, m, d] = endSetting.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(interval);
  }, [target]);
  const totalSeconds = Math.floor(timeLeft / 1000);
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="promoCountUnit">
      <strong>{String(value).padStart(2, "0")}</strong>
      <span>{label}</span>
    </div>
  );
}

function Promocoes({
  cartItems, addToCart, isCartOpen, setIsCartOpen,
  increaseQuantity, decreaseQuantity, removeFromCart,
  favoriteIds, toggleFavorite, supabaseProducts, isLoadingProducts, user, profile,
}) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const hasEndDate      = useState(() => !!getSetting("promotions_end"))[0];
  const countdownTarget = useState(() => getCountdownTarget())[0];
  const endLabel        = useState(() => getEndLabel())[0];
  const countdown = useCountdown(countdownTarget);

  const promoProducts = (supabaseProducts || []).filter(
    (p) => (p.old_price || p.oldPrice) && (p.old_price || p.oldPrice) > p.price
  );

  const maxDiscount = promoProducts.reduce((max, p) => {
    const op = p.old_price || p.oldPrice;
    if (!op) return max;
    const d = Math.round(((op - p.price) / op) * 100);
    return d > max ? d : max;
  }, 0);

  const filtered = promoProducts.filter((p) => {
    const s = searchTerm.toLowerCase();
    return !s || p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s) || (p.category && p.category.toLowerCase().includes(s));
  });

  const searchResults = (supabaseProducts || []).filter((p) => {
    const s = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s) || (p.category && p.category.toLowerCase().includes(s));
  });

  return (
    <>
      <Helmet>
        <title>Promoções | G.A Brasil Cosméticos</title>
        <meta name="description" content="Aproveite as melhores promoções em maquiagens e cosméticos para lojistas e revendedores." />
      </Helmet>

      <Header
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
      />

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
        addToCart={(p) => { addToCart(p); setSelectedProduct(null); }}
      />

      <main className="promoPage">
        {/* ── Hero ── */}
        <div className="promoHero">
          <div className="promoHeroBg" aria-hidden="true">
            <span className="promoHeroBgText">SALE</span>
          </div>

          <div className="promoHeroContent">
            <div className="promoHeroBadge">
              🔥 {maxDiscount > 0 ? `ATÉ ${maxDiscount}% OFF` : "OFERTAS ESPECIAIS"}
            </div>

            <h1 className="promoHeroTitle">Promoções<br />da Semana</h1>
            <p className="promoHeroSubtitle">
              Desconto exclusivo para lojistas e revendedores.<br />Aproveite enquanto durar!
            </p>

            {hasEndDate && (
              <div className="promoCountdown">
                <span className="promoCountLabel">Encerra em</span>
                <div className="promoCountUnits">
                  <CountdownUnit value={countdown.days}    label="dias" />
                  <span className="promoCountSep">:</span>
                  <CountdownUnit value={countdown.hours}   label="horas" />
                  <span className="promoCountSep">:</span>
                  <CountdownUnit value={countdown.minutes} label="min" />
                  <span className="promoCountSep">:</span>
                  <CountdownUnit value={countdown.seconds} label="seg" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Stat cards flutuantes ── */}
        {!isLoadingProducts && promoProducts.length > 0 && (
          <div className="promoStats">
            <div className="promoStatCard">
              <span className="promoStatIcon">🏷️</span>
              <strong>{promoProducts.length}</strong>
              <span>produto{promoProducts.length !== 1 ? "s" : ""} em oferta</span>
            </div>
            {maxDiscount > 0 && (
              <div className="promoStatCard promoStatHighlight">
                <span className="promoStatIcon">🔥</span>
                <strong>{maxDiscount}%</strong>
                <span>desconto máximo</span>
              </div>
            )}
            {hasEndDate && (
              <div className="promoStatCard">
                <span className="promoStatIcon">⏰</span>
                <strong>{endLabel}</strong>
                <span>prazo final</span>
              </div>
            )}
          </div>
        )}

        {/* ── Grade de produtos ── */}
        <div className="promoBody">
          {!isLoadingProducts && promoProducts.length === 0 ? (
            <div className="promoEmpty">
              <span>🏷️</span>
              <h2>Nenhuma promoção ativa no momento</h2>
              <p>Em breve novas ofertas. Volte em breve!</p>
            </div>
          ) : (
            <>
              <div className="promoBodyHeader">
                <h2 className="promoBodyTitle">
                  Produtos em promoção
                  {!isLoadingProducts && <span className="promoBodyCount">{filtered.length}</span>}
                </h2>

                <div className="promoSearch">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    type="search"
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {searchTerm && filtered.length === 0 && (
                <p className="promoInfo">Nenhum resultado para &ldquo;{searchTerm}&rdquo;</p>
              )}

              <div className="productGrid">
                {isLoadingProducts
                  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : filtered.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        addToCart={addToCart}
                        onOpenDetails={setSelectedProduct}
                        favoriteIds={favoriteIds}
                        toggleFavorite={toggleFavorite}
                        revealDelay={i * 0.05}
                      />
                    ))
                }
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Promocoes;
