import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/ga_brasil_sem_fundo.png";

function CustomerResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);   // true quando Supabase confirma o token
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Inscreve primeiro para não perder o evento caso ainda não tenha disparado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // Verifica se o Supabase já processou o token antes do componente montar
    // (acontece quando o módulo supabaseClient é inicializado antes do useEffect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const loc = window.location.hash + window.location.search;
      const isRecovery =
        loc.includes("type=recovery") ||
        loc.includes("type%3Drecovery") ||
        loc.includes("code=");
      if (isRecovery) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError("Não foi possível redefinir a senha. O link pode ter expirado."); return; }
    setDone(true);
    setTimeout(() => navigate("/login"), 3000);
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

  if (done) {
    return (
      <div className="authPage">
        <div className="authCard">
          <AuthLogo />
          <div className="authSentIcon">✅</div>
          <h1>Senha redefinida!</h1>
          <p className="authSubtitle">Sua nova senha foi salva. Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="authPage">
        <div className="authCard">
          <AuthLogo />
          <div className="authSentIcon">🔑</div>
          <h1>Validando link...</h1>
          <p className="authSubtitle">Aguarde enquanto verificamos seu link de recuperação.</p>
          <p className="authSentNote">
            Se você chegou aqui por engano, <Link to="/login">volte para o login</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <AuthLogo />
        <h1>Criar nova senha</h1>
        <p className="authSubtitle">Escolha uma senha forte para proteger sua conta.</p>

        <form onSubmit={handleReset} className="authForm">
          <div className="authField">
            <label>Nova senha</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="authField">
            <label>Confirmar nova senha</label>
            <input
              type="password"
              placeholder="Repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <p className="authError">{error}</p>}

          <button type="submit" className="authButton" disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerResetPassword;
