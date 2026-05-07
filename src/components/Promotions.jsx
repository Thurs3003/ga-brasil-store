function Promotions() {
  return (
    <section id="promocoes" className="promotions">
      <div className="promotionBanner">
        <div className="promotionText">
          <span>🔥 Semana da Beleza</span>
          <h2>Ofertas especiais para lojistas e revendedoras</h2>
          <p>
            Aproveite kits promocionais, descontos em produtos selecionados e
            condições especiais para compras em quantidade.
          </p>

          <a href="#produtos">Ver ofertas</a>
        </div>

        <div className="promotionDiscount">
          <small>até</small>
          <strong>40%</strong>
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