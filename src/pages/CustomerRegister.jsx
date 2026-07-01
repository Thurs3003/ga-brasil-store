import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Mail, Lock, User, Phone } from "lucide-react";
import logo from "../assets/ga_brasil_sem_fundo.png";

function getPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Fraca", color: "#ef4444", pct: 33 };
  if (score <= 3) return { label: "Média", color: "#f59e0b", pct: 66 };
  return { label: "Forte", color: "#10b981", pct: 100 };
}

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

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Informe um telefone válido com DDD, ex: (11) 99999-9999.");
      return;
    }
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

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, name: form.name, phone: form.phone });
    }

    navigate(location.state?.from || "/");
  }

  const strength = form.password ? getPasswordStrength(form.password) : null;

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
            <div className="authInputWrapper">
              <User className="authInputIcon" size={16} />
              <input
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={field("name")}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="authField">
            <label>E-mail</label>
            <div className="authInputWrapper">
              <Mail className="authInputIcon" size={16} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={field("email")}
                required
              />
            </div>
          </div>

          <div className="authField">
            <label>Telefone / WhatsApp</label>
            <div className="authInputWrapper">
              <Phone className="authInputIcon" size={16} />
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className="authField">
            <label>Senha</label>
            <div className="authInputWrapper">
              <Lock className="authInputIcon" size={16} />
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={field("password")}
                required
              />
            </div>
            {strength && (
              <div className="authStrength">
                <div className="authStrengthTrack">
                  <div
                    className="authStrengthFill"
                    style={{ width: `${strength.pct}%`, background: strength.color }}
                  />
                </div>
                <span className="authStrengthLabel" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="authField">
            <label>Confirmar senha</label>
            <div className="authInputWrapper">
              <Lock className="authInputIcon" size={16} />
              <input
                type="password"
                placeholder="Repita a senha"
                value={form.confirm}
                onChange={field("confirm")}
                required
              />
            </div>
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
