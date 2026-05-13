import { useScrollReveal } from '../hooks/useScrollReveal';

function SocialProof() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="socialProof revealGroup">
      <div className="socialProofCard revealItem">
        <strong>⭐ 4.9 de avaliação</strong>
        <p>Clientes satisfeitos com nossos produtos e atendimento.</p>
      </div>

      <div className="socialProofCard revealItem">
        <strong>🚚 Entregas para todo Brasil</strong>
        <p>Envios rápidos e seguros para lojistas e revendedoras.</p>
      </div>

      <div className="socialProofCard revealItem">
        <strong>💄 +5.000 clientes atendidos</strong>
        <p>Produtos selecionados para quem compra e revende beleza.</p>
      </div>

      <div className="socialProofCard revealItem">
        <strong>📦 Estoque variado</strong>
        <p>Maquiagens, acessórios e kits promocionais disponíveis.</p>
      </div>
    </section>
  );
}

export default SocialProof;
