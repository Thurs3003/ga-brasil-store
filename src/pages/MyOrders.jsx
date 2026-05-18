import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../hooks/useUser";
import logo from "../assets/ga_brasil_sem_fundo.png";

const STATUS_INFO = {
  novo:          { label: "Aguardando confirmação", color: "#3b82f6", icon: "🆕" },
  em_andamento:  { label: "Em andamento",            color: "#f59e0b", icon: "⏳" },
  em_separacao:  { label: "Em separação",            color: "#8b5cf6", icon: "📦" },
  enviado:       { label: "Enviado",                  color: "#06b6d4", icon: "🚚" },
  concluido:     { label: "Entregue",                 color: "#10b981", icon: "✅" },
  cancelado:     { label: "Cancelado",                color: "#ef4444", icon: "❌" },
};

function MyOrders({ repeatOrderToCart, setIsCartOpen }) {
  const { user, profile, loading: userLoading, signOut } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [repeatingId, setRepeatingId] = useState(null);

  async function handleRepeat(order) {
    if (!repeatOrderToCart) return;
    setRepeatingId(order.id);
    await repeatOrderToCart(order.items || []);
    setRepeatingId(null);
  }

  useEffect(() => {
    if (userLoading) return;
    if (!user) { navigate("/login"); return; }

    async function loadOrders() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setIsLoading(false);
    }

    loadOrders();
  }, [user, userLoading, navigate]);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (userLoading) {
    return (
      <div className="myOrdersPage">
        <div className="myOrdersLoading">
          <div className="myOrdersSpinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="myOrdersPage">
      <header className="myOrdersHeader">
        <Link to="/" className="myOrdersLogo">
          <img src={logo} alt="G.A Brasil" />
          <span className="gaText">G.A</span>
          <span className="brasilGradient"> Brasil</span>
        </Link>

        <div className="myOrdersUserInfo">
          <span>Olá, <strong>{profile?.name || user?.email}</strong></span>
          <button onClick={handleSignOut} className="myOrdersSignOut">Sair</button>
        </div>
      </header>

      <main className="myOrdersMain">
        <div className="myOrdersTitle">
          <h1>Meus Pedidos</h1>
          <Link to="/" className="myOrdersShopLink">← Continuar comprando</Link>
        </div>

        {isLoading ? (
          <div className="myOrdersLoading">
            <div className="myOrdersSpinner" />
            <p>Carregando seus pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="myOrdersEmpty">
            <span>📭</span>
            <h2>Nenhum pedido ainda</h2>
            <p>Quando você finalizar um pedido pelo WhatsApp, ele aparecerá aqui.</p>
            <Link to="/" className="myOrdersShopBtn">Ver produtos</Link>
          </div>
        ) : (
          <div className="myOrdersList">
            {orders.map((order) => {
              const info = STATUS_INFO[order.status] || STATUS_INFO.novo;
              const date = new Date(order.created_at);
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="myOrderCard">
                  <div
                    className="myOrderCardTop"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="myOrderMeta">
                      <strong>Pedido #{order.id}</strong>
                      <small>{date.toLocaleDateString("pt-BR")} às {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small>
                    </div>

                    <div
                      className="myOrderStatus"
                      style={{ color: info.color, background: info.color + "18", borderColor: info.color + "40" }}
                    >
                      <span>{info.icon}</span>
                      {info.label}
                    </div>

                    <div className="myOrderTotal">
                      <span>{order.items?.length || 0} produto(s)</span>
                      <strong>R$ {Number(order.total).toFixed(2).replace(".", ",")}</strong>
                    </div>

                    <span className="myOrderArrow">{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {isExpanded && (
                    <div className="myOrderItems">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="myOrderItem">
                          <div className="myOrderItemInfo">
                            <strong>{item.name}</strong>
                            <small>{item.brand}</small>
                          </div>
                          <span className="myOrderItemQty">× {item.quantity}</span>
                          <span className="myOrderItemPrice">
                            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      ))}

                      {order.notes && (
                        <div className="myOrderNotes">
                          <strong>Observação:</strong> {order.notes}
                        </div>
                      )}

                      {repeatOrderToCart && (
                        <button
                          className="myOrderRepeatBtn"
                          onClick={() => handleRepeat(order)}
                          disabled={repeatingId === order.id}
                        >
                          {repeatingId === order.id ? "Adicionando..." : "🔁 Repetir pedido"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyOrders;
