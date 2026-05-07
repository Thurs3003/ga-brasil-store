import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import logo from "../assets/ga-brasil.png";

function Header({ cartItems, setIsCartOpen, searchTerm, setSearchTerm }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <header className="header">
      <div className="headerTop">
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

        <div className="mobileActions">
          <button
            className="mobileIconButton"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search size={20} strokeWidth={2.3} />
          </button>

          <button
            className="mobileIconButton cartIconButton"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={20} strokeWidth={2.3} />
            {totalItems > 0 && <span>{totalItems}</span>}
          </button>
        </div>
      </div>

      <div className={`searchBox ${isSearchOpen ? "searchOpen" : ""}`}>
        <input
          type="text"
          placeholder="Buscar produtos ou marcas..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <nav>
        <a href="#inicio">Início</a>
        <a href="#produtos">Produtos</a>
        <a href="#promocoes">Promoções</a>
        <a href="#contato">Contato</a>
      </nav>

      <button className="cartButton" onClick={() => setIsCartOpen(true)}>
        🛒 Carrinho ({totalItems})
      </button>
    </header>
  );
}

export default Header;
