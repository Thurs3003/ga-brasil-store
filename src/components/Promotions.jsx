import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { getSetting, subscribeToSettings } from "../lib/settings";

function Promotions({ products = [] }) {
  const ref = useScrollReveal();
  const [isActive, setIsActive] = useState(() => !!getSetting("promotions_active"));
  const [title, setTitle]       = useState(() => getSetting("promotions_title") || "Semana da Beleza");

  useEffect(() => {
    return subscribeToSettings((settings) => {
      setIsActive(!!settings.promotions_active);
      if (settings.promotions_title) setTitle(settings.promotions_title);
    });
  }, []);

  if (!isActive) return null;

  const promoProducts = products.filter((p) => (p.old_price || p.oldPrice) > 0);
  const maxDiscount = promoProducts.reduce((max, p) => {
    const op = p.old_price || p.oldPrice;
    if (!op) return max;
    const d = Math.round(((op - p.price) / op) * 100);
    return d > max ? d : max;
  }, 0);

  return (
    <section ref={ref} id="promocoes" className="promotions reveal">
      <div className="promotionBanner">
        <div className="promotionText">
          <span>🔥 {title}</span>
          <h2>Ofertas especiais para lojistas e revendedoras</h2>
          <p>
            {promoProducts.length > 0
              ? `${promoProducts.length} produto${promoProducts.length > 1 ? "s" : ""} com desconto de até ${maxDiscount}% OFF. Aproveite enquanto durar!`
              : "Descontos em produtos selecionados e condições especiais para compras em quantidade."}
          </p>
          <Link to="/promocoes" className="promoVerBtn">Ver ofertas</Link>
        </div>

        <div className="promotionDiscount">
          <small>até</small>
          <strong>{maxDiscount > 0 ? maxDiscount : 40}%</strong>
          <span>OFF</span>
        </div>
      </div>

      <div className="promotionCards">
        <div>
          <strong>💄 Kits promocionais</strong>
          <p>Combos selecionados para revenda.</p>
        </div>
        <div>
          <strong>⭐ Mais vendidos</strong>
          <p>Produtos com maior saída na loja.</p>
        </div>
        <div>
          <strong>🎁 Condições especiais</strong>
          <p>Atendimento personalizado pelo WhatsApp.</p>
        </div>
      </div>
    </section>
  );
}

export default Promotions;
