import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";

function Logo() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
      <Icon.MessageCircle size={30} color="white" strokeWidth={2} />
    </div>
  );
}

export function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, displayName);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error ?? "Inscription impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-app px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface rounded-2xl shadow-sm p-8 flex flex-col items-center gap-5"
      >
        <Logo />

        <div className="text-center">
          <h1 className="text-xl font-semibold text-ink">Créer un compte</h1>
          <p className="text-sm text-ink-soft mt-1">Quelques infos pour commencer à discuter.</p>
        </div>

        <label className="w-full flex flex-col gap-1 text-sm text-ink-soft">
          Nom affiché
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-ink bg-app"
          />
        </label>

        <label className="w-full flex flex-col gap-1 text-sm text-ink-soft">
          Adresse e-mail
          <div className="relative">
            <Icon.Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-line pl-9 pr-3 py-2 text-ink bg-app"
            />
          </div>
        </label>

        <label className="w-full flex flex-col gap-1 text-sm text-ink-soft">
          Mot de passe
          <div className="relative">
            <Icon.Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-line pl-9 pr-9 py-2 text-ink bg-app"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <Icon.EyeOff size={18} /> : <Icon.Eye size={18} />}
            </button>
          </div>
        </label>

        {error && <p className="w-full text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Création…" : "Créer mon compte"}
        </Button>

        <p className="text-sm text-ink-soft text-center">
          Déjà un compte&nbsp;?{" "}
          <Link to="/login" className="text-primary font-medium">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
