import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/ga_brasil_sem_fundo.png";

function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("login"); // "login" | "forgot" | "sent"

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
    navigate(location.state?.from || "/");
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-senha`,
    });
    setLoading(false);
    if (error) {
      setError("Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.");
      return;
    }
    setView("sent");
  }

  function goToForgot() {
    setError("");
    setView("forgot");
  }

  function goToLogin() {
    setError("");
    setView("login");
  }

  const AuthLogo = () => (
    <div className="authLogo">
      <img src={logo} alt="G.A Brasil" />
      <div>
        <span className="gaText">G.A</span>
        <span className="brasilGradient"> Brasil</span>
      </div>
    </div>
  );

  if (view === "sent") {
    return (
      <div className="authPage">
        <div className="authCard">
          <AuthLogo />
          <div className="authSentIcon">📩</div>
          <h1>Verifique seu e-mail</h1>
          <p className="authSubtitle">
            Enviamos um link de recuperação para <strong>{email}</strong>. Clique no link para criar uma nova senha.
          </p>
          <p className="authSentNote">Não recebeu? Verifique a pasta de spam ou tente novamente.</p>
          <button className="authButton" onClick={goToForgot}>Reenviar e-mail</button>
          <button className="authLinkBtn" onClick={goToLogin}>← Voltar para o login</button>
        </div>
      </div>
    );
  }

  if (view === "forgot") {
    return (
      <div className="authPage">
        <div className="authCard">
          <AuthLogo />
          <h1>Recuperar senha</h1>
          <p className="authSubtitle">Digite seu e-mail e enviaremos um link para criar uma nova senha.</p>

          <form onSubmit={handleForgot} className="authForm">
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

            {error && <p className="authError">{error}</p>}

            <button type="submit" className="authButton" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>

          <button className="authLinkBtn" onClick={goToLogin}>← Voltar para o login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <AuthLogo />
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
            <div className="authFieldLabelRow">
              <label>Senha</label>
              <button type="button" className="authForgotLink" onClick={goToForgot}>
                Esqueceu a senha?
              </button>
            </div>
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
          <Link to="/cadastro" state={{ from: location.state?.from }}>Criar conta grátis</Link>
        </p>

        <Link to="/" className="authBackLink">← Voltar para a loja</Link>
      </div>
    </div>
  );
}

export default CustomerLogin;
