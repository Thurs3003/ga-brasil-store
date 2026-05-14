import { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/ga_brasil_sem_fundo.png";
import { useUser } from "../hooks/useUser";

function Header({
  cartItems,
  setIsCartOpen,
  searchTerm,
  setSearchTerm,
  searchResults,
  onOpenProduct,
}) {
  const { user, profile, signOut } = useUser();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSearchTerm]);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <header className={`header ${isScrolled ? "headerScrolled" : ""}`}>
      <div className="headerTop">
        <div className="logo">
          <img src={logo} alt="Logo G.A Brasil" />

          <div className="brandBlock">
            <div className="logoText">
              <span className="gaText">G.A</span>
              <span className="brasilGradient">Brasil</span>
            </div>

            <small>Cosméticos</small>
          </div>
        </div>

        <div className="mobileActions">
          <button
            className="mobileIconButton"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} strokeWidth={2.3} />
          </button>

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

      <div ref={searchBoxRef} className={`searchBox ${isSearchOpen ? "searchOpen" : ""}`}>
        <div className="searchInputWrapper">
          <Search size={16} className="searchIcon" />
          <input
            type="text"
            placeholder="Buscar produtos ou marcas..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button className="searchClear" onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>

        {searchTerm && (
          <div className="searchResults">
            {searchResults.length === 0 ? (
              <div className="searchEmpty">
                <span>😕</span>
                <p>Nenhum produto encontrado para <strong>"{searchTerm}"</strong></p>
              </div>
            ) : (
              <>
                {searchResults.slice(0, 5).map((product) => (
                  <Link
                    key={product.id}
                    to={`/produto/${product.id}`}
                    onClick={() => setSearchTerm("")}
                  >
                    <img src={product.image} alt={product.name} />

                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.brand}{product.category ? ` · ${product.category}` : ""}</span>
                    </div>

                    <small>R$ {product.price.toFixed(2).replace(".", ",")}</small>
                  </Link>
                ))}

                {searchResults.length > 5 && (
                  <div className="searchFooter">
                    <span>{searchResults.length} resultados</span>
                    <a href="#produtos" onClick={() => setSearchTerm("")}>Ver todos</a>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <nav>
        <a href="/#inicio">Início</a>
        <a href="/#produtos">Produtos</a>
        <a href="/#promocoes">Promoções</a>
        <a href="/#contato">Contato</a>
      </nav>

      <div
        className={`mobileMenuBackdrop ${isMenuOpen ? "show" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside className={`mobileMenu ${isMenuOpen ? "open" : ""}`}>
        <div className="mobileMenuHeader">
          <strong>Menu</strong>

          <button onClick={() => setIsMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <a href="/#inicio" onClick={() => setIsMenuOpen(false)}>
          Início
        </a>
        <a href="/#produtos" onClick={() => setIsMenuOpen(false)}>
          Produtos
        </a>
        <a href="/#promocoes" onClick={() => setIsMenuOpen(false)}>
          Promoções
        </a>
        <a href="/#contato" onClick={() => setIsMenuOpen(false)}>
          Contato
        </a>
      </aside>

      <div className="headerActions">
        {user ? (
          <div className="userMenu">
            <button className="userMenuBtn" onClick={() => setIsUserMenuOpen((o) => !o)}>
              👤 {profile?.name?.split(" ")[0] || "Minha conta"}
            </button>
            {isUserMenuOpen && (
              <div className="userMenuDropdown">
                <Link to="/meus-pedidos" onClick={() => setIsUserMenuOpen(false)}>📋 Meus pedidos</Link>
                <button onClick={async () => { await signOut(); setIsUserMenuOpen(false); navigate("/"); }}>
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="headerLoginBtn">Entrar</Link>
        )}

        <button className="cartButton" onClick={() => setIsCartOpen(true)}>
          🛒 Carrinho ({totalItems})
        </button>
      </div>
    </header>
  );
}

export default Header;
