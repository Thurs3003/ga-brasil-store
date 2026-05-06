import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

function ProductDetails({
  cartItems,
  addToCart,
  isCartOpen,
  setIsCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}) {
  const { id } = useParams();

  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return (
      <>
        <Header cartItems={cartItems} setIsCartOpen={setIsCartOpen} />

        <main className="productDetailsPage">
          <h1>Produto não encontrado</h1>
          <Link to="/">Voltar para início</Link>
        </main>
      </>
    );
  }

  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Header cartItems={cartItems} setIsCartOpen={setIsCartOpen} />

      <main className="productDetailsPage">
        <Link to="/" className="backLink">
          ← Voltar para loja
        </Link>

        <section className="productDetails">
          <div className="productDetailsImage">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="productDetailsInfo">
            <span className="detailsBrand">{product.brand}</span>
            <h1>{product.name}</h1>

            <p className="detailsDescription">
              Produto selecionado especialmente para revendedoras, lojistas e
              clientes que buscam qualidade com preço competitivo.
            </p>

            <div className="detailsPrice">
              <small>R$ {product.oldPrice.toFixed(2).replace(".", ",")}</small>
              <strong>R$ {product.price.toFixed(2).replace(".", ",")}</strong>
            </div>

            <div className="detailsBenefits">
              <span>✅ Produto disponível</span>
              <span>📦 Ideal para revenda</span>
              <span>💬 Pedido rápido pelo WhatsApp</span>
            </div>

            <button
              className="detailsAddButton"
              onClick={() => addToCart(product)}
            >
              Adicionar ao carrinho 🛒
            </button>
          </div>
        </section>

        <section className="relatedProducts">
          <div className="sectionTitle">
            <h2>Produtos relacionados</h2>
          </div>

          <div className="productGrid">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                addToCart={addToCart}
              />
            ))}
          </div>
        </section>
      </main>

      <CartDrawer
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeFromCart={removeFromCart}
      />
    </>
  );
}

export default ProductDetails;