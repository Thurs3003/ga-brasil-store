import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../hooks/useUser";
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

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function CustomerProfile() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, refreshProfile } = useUser();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    setProfileForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      email: user.email || "",
    });
  }, [user, profile, loading, navigate]);

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg(null);

    const phoneDigits = profileForm.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setProfileMsg({ type: "error", text: "Informe um telefone válido com DDD, ex: (11) 99999-9999." });
      return;
    }

    setProfileSaving(true);

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, name: profileForm.name, phone: profileForm.phone });

    if (profileError) {
      setProfileMsg({ type: "error", text: "Erro ao salvar dados: " + profileError.message });
      setProfileSaving(false);
      return;
    }

    const emailChanged = profileForm.email.trim().toLowerCase() !== user.email.toLowerCase();

    if (emailChanged) {
      const { error: emailError } = await supabase.auth.updateUser({ email: profileForm.email.trim() });
      if (emailError) {
        setProfileMsg({ type: "error", text: "Erro ao atualizar e-mail: " + emailError.message });
        setProfileSaving(false);
        return;
      }
      await refreshProfile();
      setProfileMsg({
        type: "success",
        text: "Dados salvos! Um link de confirmação foi enviado para o novo e-mail. O endereço só muda após você clicar no link.",
      });
    } else {
      await refreshProfile();
      setProfileMsg({ type: "success", text: "Dados salvos com sucesso!" });
    }

    setProfileSaving(false);
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.next.length < 8) {
      setPwMsg({ type: "error", text: "A nova senha deve ter pelo menos 8 caracteres." });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    setPwSaving(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: pwForm.current,
    });

    if (authError) {
      setPwMsg({ type: "error", text: "Senha atual incorreta." });
      setPwSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: pwForm.next });

    if (updateError) {
      setPwMsg({ type: "error", text: "Erro ao alterar senha: " + updateError.message });
      setPwSaving(false);
      return;
    }

    setPwForm({ current: "", next: "", confirm: "" });
    setPwMsg({ type: "success", text: "Senha alterada com sucesso!" });
    setPwSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="myOrdersPage">
        <div className="myOrdersLoading">
          <div className="myOrdersSpinner" />
        </div>
      </div>
    );
  }

  const strength = pwForm.next ? getPasswordStrength(pwForm.next) : null;

  return (
    <div className="myOrdersPage">
      <header className="myOrdersHeader">
        <Link to="/" className="myOrdersLogo">
          <img src={logo} alt="G.A Brasil" />
          <span className="gaText">G.A</span>
          <span className="brasilGradient"> Brasil</span>
        </Link>

        <div className="myOrdersUserInfo">
          <span>Olá, <strong>{profile?.name?.split(" ")[0] || user?.email}</strong></span>
          <button onClick={handleSignOut} className="myOrdersSignOut">Sair</button>
        </div>
      </header>

      <main className="myOrdersMain profileMain">
        <div className="myOrdersTitle">
          <h1>Minha conta</h1>
          <Link to="/meus-pedidos" className="myOrdersShopLink">📋 Meus pedidos</Link>
        </div>

        <div className="profileGrid">
          {/* Dados pessoais */}
          <section className="profileSection">
            <h2 className="profileSectionTitle">Dados pessoais</h2>
            <p className="profileSectionDesc">Nome, telefone e e-mail de acesso à conta.</p>

            <form onSubmit={handleProfileSave} className="authForm profileForm">
              <div className="authField">
                <label>Nome completo</label>
                <div className="authInputWrapper">
                  <User className="authInputIcon" size={16} />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
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
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                    inputMode="numeric"
                    required
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
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <span className="profileFieldHint">
                  Alterar o e-mail envia um link de confirmação para o novo endereço.
                </span>
              </div>

              {profileMsg && (
                <p className={profileMsg.type === "error" ? "authError" : "profileSuccess"}>
                  {profileMsg.text}
                </p>
              )}

              <button type="submit" className="authButton" disabled={profileSaving}>
                {profileSaving ? "Salvando..." : "Salvar dados"}
              </button>
            </form>
          </section>

          {/* Alterar senha */}
          <section className="profileSection">
            <h2 className="profileSectionTitle">Alterar senha</h2>
            <p className="profileSectionDesc">Para alterar, informe sua senha atual e escolha uma nova.</p>

            <form onSubmit={handlePasswordChange} className="authForm profileForm">
              <div className="authField">
                <label>Senha atual</label>
                <div className="authInputWrapper">
                  <Lock className="authInputIcon" size={16} />
                  <input
                    type="password"
                    placeholder="Sua senha atual"
                    value={pwForm.current}
                    onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="authField">
                <label>Nova senha</label>
                <div className="authInputWrapper">
                  <Lock className="authInputIcon" size={16} />
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={pwForm.next}
                    onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
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
                <label>Confirmar nova senha</label>
                <div className="authInputWrapper">
                  <Lock className="authInputIcon" size={16} />
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {pwMsg && (
                <p className={pwMsg.type === "error" ? "authError" : "profileSuccess"}>
                  {pwMsg.text}
                </p>
              )}

              <button type="submit" className="authButton" disabled={pwSaving}>
                {pwSaving ? "Alterando..." : "Alterar senha"}
              </button>
            </form>
          </section>
        </div>

        <div className="profileBottom">
          <Link to="/" className="myOrdersShopLink">← Continuar comprando</Link>
        </div>
      </main>
    </div>
  );
}

export default CustomerProfile;
