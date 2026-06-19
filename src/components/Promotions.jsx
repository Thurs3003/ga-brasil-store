import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSetting, subscribeToSettings } from "../lib/settings";

function parseDateLocal(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function checkActive(settings) {
  if (!settings.promotions_active) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDateLocal(settings.promotions_start);
  const end   = parseDateLocal(settings.promotions_end);
  if (start && today < start) return false;
  if (end   && today > end)   return false;
  return true;
}

function Promotions({ products = [] }) {
  const [isActive, setIsActive] = useState(() => checkActive({
    promotions_active: getSetting("promotions_active"),
    promotions_start:  getSetting("promotions_start"),
    promotions_end:    getSetting("promotions_end"),
  }));
  const [title, setTitle] = useState(() => getSetting("promotions_title") || "Semana da Beleza");

  useEffect(() => {
    return subscribeToSettings((settings) => {
      setIsActive(checkActive(settings));
      if (settings.promotions_title) setTitle(settings.promotions_title);
    });
  }, []);

  if (!isActive) return null;

  const promoProducts = products.filter((p) => p.tag === "Promoção");
  const maxDiscount = promoProducts.reduce((max, p) => {
    const op = p.old_price || p.oldPrice;
    if (!op) return max;
    const d = Math.round(((op - p.price) / op) * 100);
    return d > max ? d : max;
  }, 0);

  return (
    <section id="promocoes" className="promotions promotionsFadeIn">
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
