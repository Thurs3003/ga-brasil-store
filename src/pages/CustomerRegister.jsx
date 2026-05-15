import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/ga_brasil_sem_fundo.png";

function CustomerRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });

    if (signUpError) {
      if (signUpError.status === 429 || signUpError.message?.toLowerCase().includes("rate limit")) {
        setError("Muitos cadastros em pouco tempo. Aguarde alguns minutos e tente novamente.");
      } else if (signUpError.message?.toLowerCase().includes("already registered") || signUpError.message?.toLowerCase().includes("already exists")) {
        setError("Este e-mail já possui uma conta. Tente entrar.");
      } else {
        setError("Erro ao criar conta: " + signUpError.message);
      }
      setLoading(false);
      return;
    }

    if (data.user && form.phone) {
      await supabase.from("profiles").upsert({ id: data.user.id, name: form.name, phone: form.phone });
    }

    navigate(location.state?.from || "/");
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

        <h1>Criar minha conta</h1>
        <p className="authSubtitle">Cadastre-se para acompanhar seus pedidos</p>

        <form onSubmit={handleRegister} className="authForm">
          <div className="authField">
            <label>Nome completo</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={form.name}
              onChange={field("name")}
              required
              autoFocus
            />
          </div>

          <div className="authField">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={field("email")}
              required
            />
          </div>

          <div className="authField">
            <label>Telefone / WhatsApp <span className="authOptional">(opcional)</span></label>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
              inputMode="numeric"
            />
          </div>

          <div className="authField">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={field("password")}
              required
            />
          </div>

          <div className="authField">
            <label>Confirmar senha</label>
            <input
              type="password"
              placeholder="Repita a senha"
              value={form.confirm}
              onChange={field("confirm")}
              required
            />
          </div>

          {error && <p className="authError">{error}</p>}

          <button type="submit" className="authButton" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="authFooterText">
          Já tem conta?{" "}
          <Link to="/login">Entrar</Link>
        </p>

        <Link to="/" className="authBackLink">← Voltar para a loja</Link>
      </div>
    </div>
  );
}

export default CustomerRegister;
