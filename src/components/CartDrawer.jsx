import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getOrdersWA, buildWAUrl } from "../lib/whatsapp";

// CEP de origem da loja: 01027-001 — São Paulo, SP
const STORE_LAT = -23.5414;
const STORE_LNG = -46.6353;

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
  if (km <= 50)   return { price: 0,  days: "1-2 dias úteis" };
  if (km <= 150)  return { price: 15, days: "2-3 dias úteis" };
  if (km <= 300)  return { price: 22, days: "2-3 dias úteis" };
  if (km <= 600)  return { price: 32, days: "3-5 dias úteis" };
  if (km <= 1000) return { price: 42, days: "4-6 dias úteis" };
  if (km <= 1500) return { price: 52, days: "5-8 dias úteis" };
  if (km <= 2500) return { price: 62, days: "7-10 dias úteis" };
  return { price: 75, days: "10-14 dias úteis" };
}

// Fallback por UF caso o geocoding falhe
const FREIGHT_FALLBACK = {
  SP: { price: 0,  days: "1-2 dias úteis" },
  RJ: { price: 22, days: "2-3 dias úteis" },
  MG: { price: 18, days: "2-3 dias úteis" },
  ES: { price: 28, days: "3-4 dias úteis" },
  PR: { price: 22, days: "2-3 dias úteis" },
  SC: { price: 28, days: "3-4 dias úteis" },
  RS: { price: 32, days: "3-5 dias úteis" },
  GO: { price: 30, days: "3-5 dias úteis" },
  DF: { price: 30, days: "3-5 dias úteis" },
  MT: { price: 38, days: "4-6 dias úteis" },
  MS: { price: 35, days: "4-6 dias úteis" },
  BA: { price: 35, days: "4-6 dias úteis" },
  SE: { price: 38, days: "5-7 dias úteis" },
  AL: { price: 38, days: "5-7 dias úteis" },
  PE: { price: 40, days: "5-7 dias úteis" },
  PB: { price: 42, days: "5-7 dias úteis" },
  RN: { price: 42, days: "5-7 dias úteis" },
  CE: { price: 42, days: "5-7 dias úteis" },
  PI: { price: 45, days: "6-8 dias úteis" },
  MA: { price: 45, days: "6-8 dias úteis" },
  PA: { price: 48, days: "7-10 dias úteis" },
  AP: { price: 52, days: "8-12 dias úteis" },
  AM: { price: 55, days: "8-12 dias úteis" },
  RO: { price: 50, days: "7-10 dias úteis" },
  AC: { price: 58, days: "10-14 dias úteis" },
  RR: { price: 58, days: "10-14 dias úteis" },
  TO: { price: 38, days: "5-7 dias úteis" },
};

function CartDrawer({
  cartItems,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  user,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [cep, setCep] = useState("");
  const [freight, setFreight] = useState(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const cepCacheRef = useRef({});
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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
      .select("id, price, name, brand")
      .in("id", ids);

    if (priceError || !freshProducts) {
      waWindow?.close();
      setIsCheckingOut(false);
      return;
    }

    const priceMap = Object.fromEntries(freshProducts.map((p) => [p.id, p.price]));

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
    }));

    const { error: orderError } = await supabase.from("orders").insert([{
      items: orderItems,
      total: validatedTotal,
      status: "aguardando",
      user_id: user?.id || null,
    }]);

    if (orderError) {
      waWindow?.close();
      setIsCheckingOut(false);
      return;
    }

    const productsMessage = validatedItems
      .map((item) => {
        const subtotal = item.price * item.quantity;
        return `• ${item.name}
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
          <div>
            <h2>Meu carrinho</h2>
            <p>{cartItems.length} produto(s)</p>
          </div>

          <button onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="emptyCart">
            <span>🛒</span>
            <h3>Seu carrinho está vazio</h3>
            <p>Adicione produtos para montar seu pedido.</p>
          </div>
        ) : (
          <>
            <div className="cartItems">
              {cartItems.map((item) => (
                <div className="cartItem" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cartItemInfo">
                    <strong>{item.name}</strong>
                    <small>{item.brand}</small>

                    <p>R$ {item.price.toFixed(2).replace(".", ",")}</p>

                    <div className="quantityControls">
                      <button onClick={() => decreaseQuantity(item.id)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)}>
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="removeItem"
                    onClick={() => removeFromCart(item.id)}
                  >
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
                  <div className="freightResult">
                    <div className="freightResultLeft">
                      <span className="freightCity">
                        {freight.city} — {freight.state}
                        {freight.km != null && <em className="freightKm"> ≈ {freight.km} km</em>}
                      </span>
                      <span className="freightDays">⏱ {freight.days}</span>
                    </div>
                    <span className="freightPrice">
                      {freight.price === 0 ? "Grátis" : `R$ ${freight.price.toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                )}

                <p className="freightDisclaimer">ℹ️ Valores estimados. Frete confirmado pelo WhatsApp.</p>
              </div>

              <div className="cartTotal">
                <span>Subtotal</span>
                <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
              </div>

              {freight && freight.price > 0 && (
                <div className="cartTotal cartTotalFreight">
                  <span>Frete estimado</span>
                  <strong>R$ {freight.price.toFixed(2).replace(".", ",")}</strong>
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

              <button
                className="checkoutButton"
                onClick={finishOrder}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processando..." : "Finalizar pelo WhatsApp"}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
