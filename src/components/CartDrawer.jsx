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
    0
  );

  function finishOrder() {
    const message = cartItems
      .map(
        (item) =>
          `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity)
            .toFixed(2)
            .replace(".", ",")}`
      )
      .join("%0A");

    const totalMessage = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;

    window.open(
      `https://wa.me/5511937739808?text=Olá! Gostaria de fazer um pedido:%0A%0A${message}%0A%0A${totalMessage}`,
      "_blank"
    );
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
                      <button onClick={() => decreaseQuantity(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)}>+</button>
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