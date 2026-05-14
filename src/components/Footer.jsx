import { getFooterWA, buildWAUrl } from "../lib/whatsapp";

function Footer() {
  const waUrl = buildWAUrl(getFooterWA());
  return (
    <footer id="contato" className="footer">
      <div className="footerContent">
        <div className="footerAbout">
          <h3>Sobre nós</h3>
          <p>
            A G.A Brasil é uma distribuidora de maquiagens e cosméticos localizada em São Paulo, focada em atender lojistas, revendedoras e profissionais da beleza com qualidade e agilidade. Trabalhamos com marcas reconhecidas no mercado — como Max Love, Vivai, Fenzza, Lady Beauty e outras — oferecendo produtos selecionados, preços competitivos e atendimento personalizado via WhatsApp. Nossa missão é ser a parceira de confiança de quem vende beleza.
          </p>
        </div>

        <div className="footerBrand">
          <h2 className="footerLogo">G.A Brasil</h2>

          <p>
            Distribuidora de maquiagens e acessórios para lojistas e
            revendedores.
          </p>

          <div className="footerSocials">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Whatsapp"
            >
              W
            </a>

            <a
              href="https://www.instagram.com/gabrasiloficial/?hl=en"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              I
            </a>
          </div>
        </div>

        <div className="footerColumn">
          <h3>Contato</h3>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
          >
            Whatsapp
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <span>São Paulo - SP</span>
        </div>

        <div className="footerColumn">
          <h3>Atendimento</h3>
          <span>Segunda à Quinta — 08h às 18h</span>
          <span>Sexta — 08h às 17h</span>
          <span>Pedidos via WhatsApp</span>
        </div>

        <div className="footerColumn">
          <h3>Navegação</h3>
          <a href="#inicio">Início</a>
          <a href="#produtos">Produtos</a>
          <a href="#contato">Contato</a>
        </div>
      </div>

      <div className="footerBottom">
        <p>© 2026 G.A Brasil - Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
export default Footer;
