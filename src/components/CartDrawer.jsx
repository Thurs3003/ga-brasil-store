import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getOrdersWA, buildWAUrl } from "../lib/whatsapp";

const FREIGHT = {
  SP: { price: 0,  days: "1-2 dias úteis",  label: "Grátis" },
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
  const [cep, setCep] = useState("");
  const [freight, setFreight] = useState(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState("");
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  async function calculateFreight() {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) { setFreightError("CEP inválido. Digite 8 dígitos."); return; }
    setFreightLoading(true);
    setFreightError("");
    setFreight(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) { setFreightError("CEP não encontrado."); setFreightLoading(false); return; }
      const rate = FREIGHT[data.uf] || { price: 50, days: "5-10 dias úteis" };
      setFreight({ ...rate, city: data.localidade, state: data.uf });
    } catch {
      setFreightError("Erro ao consultar CEP. Tente novamente.");
    }
    setFreightLoading(false);
  }

  async function finishOrder() {
    if (cartItems.length === 0) return;

    const orderItems = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: orderError } = await supabase.from("orders").insert([{
      items: orderItems,
      total,
      status: "novo",
      user_id: user?.id || null,
    }]);
    if (orderError) {
      console.error("[GA Brasil] Erro ao salvar pedido:", orderError.message);
    }

    const productsMessage = cartItems
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
R$ ${total.toFixed(2).replace(".", ",")}

Aguardo as informações para pagamento e entrega.`;

    window.open(buildWAUrl(getOrdersWA(), message), "_blank");
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
                      <span className="freightCity">{freight.city} — {freight.state}</span>
                      <span className="freightDays">⏱ {freight.days}</span>
                    </div>
                    <span className="freightPrice">
                      {freight.price === 0 ? "Grátis" : `R$ ${freight.price.toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                )}

                <small className="freightDisclaimer">* Valores estimados. Frete confirmado pelo WhatsApp.</small>
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

              <button className="checkoutButton" onClick={finishOrder}>
                Finalizar pelo WhatsApp
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
