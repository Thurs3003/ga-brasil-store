import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CartDrawer from "../components/CartDrawer";
import ProductModal from "../components/ProductModal";
import Footer from "../components/Footer";

function getWeekEnd() {
  const now = new Date();
  const daysUntilSunday = now.getDay() === 0 ? 7 : 7 - now.getDay();
  const end = new Date(now);
  end.setDate(now.getDate() + daysUntilSunday);
  end.setHours(23, 59, 59, 0);
  return end;
}

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
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
  cartItems,
  addToCart,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  favoriteIds,
  toggleFavorite,
  supabaseProducts,
  isLoadingProducts,
  user,
}) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const weekEnd = useState(() => getWeekEnd().getTime())[0];
  const countdown = useCountdown(weekEnd);

  const promoProducts = (supabaseProducts || []).filter(
    (p) => (p.old_price || p.oldPrice) && (p.old_price || p.oldPrice) > p.price
  );

  const filtered = promoProducts.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      !s ||
      p.name.toLowerCase().includes(s) ||
      p.brand.toLowerCase().includes(s) ||
      (p.category && p.category.toLowerCase().includes(s))
    );
  });

  const searchResults = supabaseProducts.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.brand.toLowerCase().includes(s) ||
      (p.category && p.category.toLowerCase().includes(s))
    );
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
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={(p) => { addToCart(p); setSelectedProduct(null); }}
      />

      <main className="promoPage">
        <div className="promoHero">
          <div className="promoHeroContent">
            <span className="promoEyebrow">🔥 Ofertas especiais</span>
            <h1>Promoções da Semana</h1>
            <p>Produtos com desconto para lojistas e revendedores. Aproveite enquanto dura!</p>

            <div className="promoCountdown">
              <span className="promoCountLabel">Termina em:</span>
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
          </div>
        </div>

        <div className="promoBody">
          {!isLoadingProducts && promoProducts.length === 0 ? (
            <div className="promoEmpty">
              <span>🏷️</span>
              <h2>Nenhuma promoção ativa no momento</h2>
              <p>Em breve novas ofertas. Volte em breve!</p>
            </div>
          ) : (
            <>
              <div className="promoInfo">
                <strong>{filtered.length} produto{filtered.length !== 1 ? "s" : ""} em promoção</strong>
                {searchTerm && <span> para "{searchTerm}"</span>}
              </div>

              <div className="productsGrid">
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
