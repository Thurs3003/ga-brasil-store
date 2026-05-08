function CartDrawer({
  cartItems,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function finishOrder() {
    if (cartItems.length === 0) return;

    const productsMessage = cartItems
      .map((item) => {
        const subtotal = item.price * item.quantity;

        return `• ${item.name}
Marca: ${item.brand}
Quantidade: ${item.quantity}
Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}`;
      })
      .join("\n\n");

    const totalMessage = total.toFixed(2).replace(".", ",");

    const message = `🛍️ Pedido G.A Brasil

Olá! Gostaria de finalizar meu pedido.

📦 Produtos:
${productsMessage}

💰 Total do pedido:
R$ ${totalMessage}

🚚 Aguardo as informações para pagamento e entrega.`;

    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/5511937739808?text=${encodedMessage}`, "_blank");
  }

  return (
    <>
      <div
        className={`cartBackdrop ${isCartOpen ? "show" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`cartDrawer ${isCartOpen ? "open" : ""}`}>
        <div className="cartHeader">
          <div>
            <h2>Meu carrinho</h2>
            <p>{cartItems.length} produto(s)</p>
          </div>

          <button onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="emptyCart">
            <span>🛒</span>
            <h3>Seu carrinho está vazio</h3>
            <p>Adicione produtos para montar seu pedido.</p>
          </div>
        ) : (
          <>
            <div className="cartItems">
              {cartItems.map((item) => (
                <div className="cartItem" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cartItemInfo">
                    <strong>{item.name}</strong>
                    <small>{item.brand}</small>

                    <p>R$ {item.price.toFixed(2).replace(".", ",")}</p>

                    <div className="quantityControls">
                      <button onClick={() => decreaseQuantity(item.id)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)}>
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="removeItem"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className="cartFooter">
              <div className="cartTotal">
                <span>Total</span>
                <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
              </div>

              <button className="checkoutButton" onClick={finishOrder}>
                Finalizar pelo WhatsApp
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
