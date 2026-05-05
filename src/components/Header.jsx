function Header() {
    return (
        <header className="header">
            <div className="logo">G.A Brasil</div>

            <nav>
                <a href="#">Início</a>
                <a href="#">Produtos</a>
                <a href="#">Promoções</a>
                <a href="#">Contato</a>
            </nav>

            <button className="cartButton">🛒 Carrinho</button>
        </header>
    );
}

export default Header;