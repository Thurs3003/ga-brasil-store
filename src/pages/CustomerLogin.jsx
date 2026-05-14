import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/ga_brasil_sem_fundo.png";

function CustomerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    navigate("/meus-pedidos");
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLogo">
          <img src={logo} alt="G.A Brasil" />
          <div>
            <span className="gaText">G.A</span>
            <span className="brasilGradient"> Brasil</span>
          </div>
        </div>

        <h1>Entrar na minha conta</h1>
        <p className="authSubtitle">Acompanhe seus pedidos e gerencie sua conta</p>

        <form onSubmit={handleLogin} className="authForm">
          <div className="authField">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="authField">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="authError">{error}</p>}

          <button type="submit" className="authButton" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="authFooterText">
          Não tem conta?{" "}
          <Link to="/cadastro">Criar conta grátis</Link>
        </p>

        <Link to="/" className="authBackLink">← Voltar para a loja</Link>
      </div>
    </div>
  );
}

export default CustomerLogin;
