import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email ou senha inválidos.");
      setLoading(false);
      return;
    }

    // Verificar se o usuário tem role admin antes de redirecionar
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Acesso não autorizado.");
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
  }

  return (
    <div className="adminLogin">
      <form onSubmit={handleLogin}>
        <h1>Painel Admin</h1>

        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && <p className="adminLoginError">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
