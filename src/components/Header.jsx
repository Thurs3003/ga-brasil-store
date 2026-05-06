import logo from "../assets/ga-brasil.png";

function Header({ cartItems, setIsCartOpen, searchTerm, setSearchTerm }) {
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Logo G.A Brasil" />

        <div className="brandBlock">
          <div className="logoText">
            <span className="gaText">G.A</span>
            <span className="brasilGradient">Brasil</span>
          </div>

          <small>Distribuidora de Maquiagens</small>
        </div>
      </div>

      <div className="searchBox">
        <input
          type="text"
          placeholder="Buscar produtos ou marcas..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <nav>
        <a href="#">Início</a>
        <a href="#">Produtos</a>
        <a href="#">Promoções</a>
        <a href="#">Contato</a>
      </nav>

      <button className="cartButton" onClick={() => setIsCartOpen(true)}>
        🛒 Carrinho ({totalItems})
      </button>
    </header>
  );
}

export default Header;
