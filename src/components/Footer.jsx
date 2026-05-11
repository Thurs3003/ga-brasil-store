function Footer() {
  return (
    <footer id="contato" className="footer">
      <div className="footerContent">
        <div className="footerBrand">
          <h2 className="footerLogo">G.A Brasil</h2>

          <p>
            Distribuidora de maquiagens e acessórios para lojistas e
            revendedores.
          </p>

          <div className="footerSocials">
            <a
              href="https://wa.me/5511999999999"
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
            href="https://wa.me/5511999999999"
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
          <span>Segunda à Sexta</span>
          <span>08h às 18h</span>
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
