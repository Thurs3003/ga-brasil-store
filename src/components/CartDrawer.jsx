import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getOrdersWA, buildWAUrl } from "../lib/whatsapp";
import { ORDER_MINIMUM } from "../lib/orderConfig";

// Loja: Rua 25 de Março, Sé — São Paulo, SP (CEP 01027-001)
const STORE_LAT = -23.5382;
const STORE_LNG = -46.6308;

// Raio de entrega local gratuita (Brás, Pari, Bom Retiro, Luz, Sé, Mooca)
const FREE_DELIVERY_KM = 5;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function rateByDistance(km) {
  if (km <= FREE_DELIVERY_KM) return { price: 0,  days: "Entrega local — 1 dia útil" };
  if (km <= 30)   return { price: 12, days: "1-2 dias úteis" };  // SP capital (resto)
  if (km <= 150)  return { price: 20, days: "2-3 dias úteis" };  // Grande SP + interior próximo
  if (km <= 400)  return { price: 30, days: "3-5 dias úteis" };  // Interior SP distante
  if (km <= 800)  return { price: 42, days: "4-6 dias úteis" };  // RJ, PR, MG, ES
  if (km <= 1500) return { price: 52, days: "5-8 dias úteis" };  // Sul, GO, DF, BA
  if (km <= 2500) return { price: 62, days: "7-10 dias úteis" }; // Nordeste, MT, MS
  return { price: 75, days: "10-14 dias úteis" };                // Norte extremo
}

// Fallback por UF quando o geocoding falha
const FREIGHT_FALLBACK = {
  SP: { price: 20, days: "2-3 dias úteis" }, // SP interior — geolocalização falhou
  RJ: { price: 42, days: "4-6 dias úteis" },
  MG: { price: 38, days: "3-5 dias úteis" },
  ES: { price: 42, days: "4-6 dias úteis" },
  PR: { price: 42, days: "4-6 dias úteis" },
  SC: { price: 45, days: "4-6 dias úteis" },
  RS: { price: 52, days: "5-8 dias úteis" },
  GO: { price: 52, days: "5-8 dias úteis" },
  DF: { price: 52, days: "5-8 dias úteis" },
  MT: { price: 62, days: "7-10 dias úteis" },
  MS: { price: 55, days: "5-8 dias úteis" },
  BA: { price: 55, days: "5-8 dias úteis" },
  SE: { price: 58, days: "5-7 dias úteis" },
  AL: { price: 58, days: "5-7 dias úteis" },
  PE: { price: 62, days: "5-7 dias úteis" },
  PB: { price: 62, days: "5-7 dias úteis" },
  RN: { price: 62, days: "5-7 dias úteis" },
  CE: { price: 62, days: "5-7 dias úteis" },
  PI: { price: 65, days: "6-8 dias úteis" },
  MA: { price: 65, days: "6-8 dias úteis" },
  PA: { price: 68, days: "7-10 dias úteis" },
  AP: { price: 72, days: "8-12 dias úteis" },
  AM: { price: 75, days: "8-12 dias úteis" },
  RO: { price: 70, days: "7-10 dias úteis" },
  AC: { price: 75, days: "10-14 dias úteis" },
  RR: { price: 75, days: "10-14 dias úteis" },
  TO: { price: 58, days: "5-7 dias úteis" },
};


function CartDrawer({
  cartItems,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  user,
  profile,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [cep, setCep] = useState("");
  const [freight, setFreight] = useState(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [stockMap, setStockMap] = useState({});
  const [checkoutError, setCheckoutError] = useState("");
  const cepCacheRef = useRef({});

  useEffect(() => {
    if (!isCartOpen || cartItems.length === 0) { setStockMap({}); return; }
    const ids = [...new Set(cartItems.map((item) => item.id))];
    supabase.from("products").select("id, stock").in("id", ids).then(({ data }) => {
      if (data) setStockMap(Object.fromEntries(data.map((p) => [p.id, p.stock])));
    });
  }, [isCartOpen, cartItems.length]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const remaining = Math.max(0, ORDER_MINIMUM - total);

  async function calculateFreight() {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) { setFreightError("CEP inválido. Digite 8 dígitos."); return; }

    if (cepCacheRef.current[cleaned]) {
      setFreight(cepCacheRef.current[cleaned]);
      setFreightError("");
      return;
    }

    setFreightLoading(true);
    setFreightError("");
    setFreight(null);
    try {
      const cepRes = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const cepData = await cepRes.json();
      if (cepData.erro) { setFreightError("CEP não encontrado."); setFreightLoading(false); return; }

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cleaned}&country=Brazil&format=json&limit=1`,
        { headers: { "Accept-Language": "pt-BR", "User-Agent": "GABrasilStore/1.0" } }
      );
      const geoData = await geoRes.json();

      let result;
      if (!geoData.length) {
        const rate = FREIGHT_FALLBACK[cepData.uf] || { price: 50, days: "5-10 dias úteis" };
        result = { ...rate, city: cepData.localidade, state: cepData.uf, km: null };
      } else {
        const km = haversineKm(STORE_LAT, STORE_LNG, parseFloat(geoData[0].lat), parseFloat(geoData[0].lon));
        result = { ...rateByDistance(km), city: cepData.localidade, state: cepData.uf, km };
      }

      cepCacheRef.current[cleaned] = result;
      setFreight(result);
    } catch {
      setFreightError("Erro ao calcular frete. Tente novamente.");
    }
    setFreightLoading(false);
  }

  function goToLogin() {
    setIsCartOpen(false);
    navigate("/login", { state: { from: location.pathname } });
  }

  async function finishOrder() {
    if (cartItems.length === 0 || isCheckingOut) return;

    if (!user) {
      goToLogin();
      return;
    }

    setIsCheckingOut(true);

    // Abre a janela ANTES de qualquer await — mantém o contexto do gesto do usuário.
    // Necessário para iOS Safari, que bloqueia window.open após operações assíncronas.
    const waWindow = window.open("about:blank", "_blank");

    // Busca preços reais do banco para evitar manipulação via localStorage
    const ids = cartItems.map((item) => item.id);
    const { data: freshProducts, error: priceError } = await supabase
      .from("products")
      .select("id, price, name, brand, stock")
      .in("id", ids);

    if (priceError || !freshProducts) {
      waWindow?.close();
      setIsCheckingOut(false);
      return;
    }

    const priceMap = Object.fromEntries(freshProducts.map((p) => [p.id, p.price]));

    const outOfStockNames = cartItems
      .filter((item) => {
        const fresh = freshProducts.find((p) => p.id === item.id);
        return fresh && fresh.stock === 0;
      })
      .map((item) => item.name);

    if (outOfStockNames.length > 0) {
      waWindow?.close();
      setCheckoutError(`Sem estoque: ${outOfStockNames.join(", ")}. Remova do carrinho para continuar.`);
      setIsCheckingOut(false);
      return;
    }

    setCheckoutError("");

    const validatedItems = cartItems.map((item) => ({
      ...item,
      price: priceMap[item.id] ?? item.price,
    }));

    const validatedTotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderItems = validatedItems.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      quantity: item.quantity,
      ...(item.selectedVariant ? { selectedVariant: item.selectedVariant } : {}),
    }));

    const { error: orderError } = await supabase.from("orders").insert([{
      items: orderItems,
      total: validatedTotal,
      status: "aguardando",
      user_id: user?.id || null,
      cep: cep.replace(/\D/g, "") || null,
      customer_name: profile?.name || user?.user_metadata?.name || null,
      customer_email: user?.email || null,
      customer_phone: profile?.phone || null,
    }]);

    if (orderError) {
      waWindow?.close();
      setIsCheckingOut(false);
      return;
    }

    const productsMessage = validatedItems
      .map((item) => {
        const subtotal = item.price * item.quantity;
        const variantLine = item.selectedVariant ? `\nVariante: ${item.selectedVariant}` : "";
        return `• ${item.name}${variantLine}
Marca: ${item.brand}
Quantidade: ${item.quantity}
Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}`;
      })
      .join("\n\n");

    const message = `Pedido G.A Brasil

Olá! Gostaria de finalizar meu pedido.

Produtos:
${productsMessage}

Total do pedido:
R$ ${validatedTotal.toFixed(2).replace(".", ",")}

Aguardo as informações para pagamento e entrega.`;

    const waUrl = buildWAUrl(getOrdersWA(), message);
    if (waWindow) {
      waWindow.location.href = waUrl;
    } else {
      window.location.href = waUrl;
    }
    setIsCheckingOut(false);
  }

  return (
    <>
      <div
        className={`cartBackdrop ${isCartOpen ? "show" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`cartDrawer ${isCartOpen ? "open" : ""}`}>
        <div className="cartHeader">
          <div className="cartHeaderInfo">
            <h2>Meu carrinho</h2>
            <span className="cartCountBadge">
              {cartItems.reduce((s, i) => s + i.quantity, 0)} {cartItems.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "itens"}
            </span>
          </div>
          <button onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="emptyCart">
            <svg className="emptyCartIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="72" height="72">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>Seu carrinho está vazio</h3>
            <p>Adicione produtos para montar seu pedido.</p>
            <Link to="/produtos" className="emptyCartBtn" onClick={() => setIsCartOpen(false)}>
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="cartItems">
              {cartItems.map((item) => (
                <div className="cartItem" key={item.cartKey}>
                  <img src={item.image} alt={item.name} />

                  <div className="cartItemInfo">
                    <strong>{item.name}</strong>
                    <small>{item.brand}</small>
                    {item.selectedVariant && (
                      <span className="cartItemVariant">{item.selectedVariant}</span>
                    )}
                    {stockMap[item.id] === 0 && (
                      <span className="cartItemOutOfStock">Indisponível — remova do carrinho</span>
                    )}

                    <p>R$ {item.price.toFixed(2).replace(".", ",")}</p>

                    <div className="quantityControls">
                      <button onClick={() => decreaseQuantity(item.cartKey)}>-</button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.cartKey)}
                        disabled={
                          (stockMap[item.id] != null && item.quantity >= stockMap[item.id]) ||
                          (stockMap[item.id] == null && item.stock != null && item.quantity >= item.stock)
                        }
                      >+</button>
                    </div>
                    {(() => {
                      const limit = stockMap[item.id] ?? item.stock;
                      return limit != null && item.quantity >= limit && limit > 0
                        ? <span className="cartStockLimit">Máx. {limit} em estoque</span>
                        : null;
                    })()}
                  </div>

                  <button
                    className="removeItem"
                    onClick={() => removeFromCart(item.cartKey)}
                    title="Remover item"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className="cartFooter">
              <div className="freightCalculator">
                <p className="freightTitle">📦 Calcular frete</p>
                <div className="freightInputRow">
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onKeyDown={(e) => e.key === "Enter" && calculateFreight()}
                    className="freightCepInput"
                    maxLength={8}
                  />
                  <button
                    className="freightCalcBtn"
                    onClick={calculateFreight}
                    disabled={freightLoading}
                  >
                    {freightLoading ? "..." : "Calcular"}
                  </button>
                </div>

                {freightError && <p className="freightError">{freightError}</p>}

                {freight && (
                  freight.price === 0 ? (
                    <div className="freightResultFree">
                      <span className="freightFreeIcon">🎉</span>
                      <div className="freightFreeText">
                        <strong>Frete grátis para sua região!</strong>
                        <span>{freight.city} — {freight.state} · {freight.days}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="freightResult">
                      <div className="freightResultLeft">
                        <span className="freightCity">
                          {freight.city} — {freight.state}
                          {freight.km != null && <em className="freightKm"> ≈ {freight.km} km</em>}
                        </span>
                        <span className="freightDays">⏱ {freight.days}</span>
                      </div>
                      <span className="freightPrice">
                        R$ {freight.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )
                )}

                <p className="freightDisclaimer">ℹ️ Valores estimados. Frete confirmado pelo WhatsApp.</p>
              </div>

              <div className="cartSummary">
                <div className="cartSummaryRow">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                  <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="cartSummaryRow">
                  <span>Frete</span>
                  <span>
                    {freight
                      ? freight.price === 0
                        ? "Grátis 🎉"
                        : `R$ ${freight.price.toFixed(2).replace(".", ",")}`
                      : "A calcular"}
                  </span>
                </div>
                <div className="cartSummaryDivider" />
                <div className="cartSummaryTotal">
                  <span>Total estimado</span>
                  <strong>R$ {(total + (freight?.price || 0)).toFixed(2).replace(".", ",")}</strong>
                </div>
              </div>

              {remaining > 0 && (
                <div className="cartMinimumNotice">
                  <span>🛍️</span>
                  <p>
                    Falta <strong>R$ {remaining.toFixed(2).replace(".", ",")}</strong> para o pedido mínimo de R$ {ORDER_MINIMUM.toFixed(2).replace(".", ",")}.
                  </p>
                </div>
              )}

              {!user && (
                <div className="cartLoginNotice">
                  <span className="cartLoginNoticeIcon">🔒</span>
                  <div>
                    <p className="cartLoginNoticeText">
                      Para finalizar sua compra, você precisa ter uma conta.
                    </p>
                    <p className="cartLoginNoticeLinks">
                      <button
                        className="cartLoginNoticeBtn"
                        onClick={goToLogin}
                      >
                        Entrar
                      </button>
                      {" ou "}
                      <button
                        className="cartLoginNoticeBtn"
                        onClick={() => { setIsCartOpen(false); navigate("/cadastro"); }}
                      >
                        Criar conta
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {checkoutError && (
                <p className="cartCheckoutError">{checkoutError}</p>
              )}

              <button
                className="checkoutButton"
                onClick={finishOrder}
                disabled={isCheckingOut || remaining > 0 || cartItems.some((item) => stockMap[item.id] === 0)}
              >
                {isCheckingOut ? "Processando..." : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.057 23.552a.75.75 0 0 0 .921.921l5.69-1.475A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.205-1.432l-.372-.218-3.853.999 1.02-3.735-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Finalizar pelo WhatsApp
                  </>
                )}
              </button>
              {!isCheckingOut && <p className="checkoutHint">Você será redirecionado para o WhatsApp</p>}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
