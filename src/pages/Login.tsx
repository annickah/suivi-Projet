import { useState, type FormEvent } from "react";
import { KeyRound, LogIn } from "lucide-react";
import { useApp } from "../store";
import { Field, PrimaryButton, inputClass } from "../components/ui";

export function LoginPage() {
  const { signIn, pushToast } = useApp();
  const [email, setEmail] = useState("alice@suiviprojets.fr");
  const [password, setPassword] = useState("suivi-projets");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    signIn();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="animate-page-in w-full max-w-md">
        <div className="rounded-lg border border-hairline bg-surface p-8 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(15,23,42,0.25)]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">SP</span>
            <span className="text-base font-bold tracking-tight text-gray-900">Suivi Projets</span>
          </div>

          <h1 className="mt-6 text-xl font-bold tracking-tight text-gray-900">Bon retour parmi nous</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
            Connectez-vous pour retrouver vos projets, vos clients et vos notifications.
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <Field label="Email professionnel">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClass}
              />
            </Field>
            <Field label="Mot de passe">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </Field>
            <div className="flex items-center justify-between text-[13px]">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600 select-none">
                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-gray-300 accent-ink" />
                Se souvenir de moi
              </label>
              <button
                type="button"
                onClick={() => pushToast("Lien de réinitialisation envoyé par email")}
                className="font-medium text-gray-600 transition-colors hover:text-ink hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <PrimaryButton type="submit" className="w-full justify-center py-2.5">
              <LogIn className="h-4 w-4" />
              Se connecter
            </PrimaryButton>
          </form>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <KeyRound className="h-3 w-3" />
          Espace interne — © 2026 Suivi Projets
        </p>
      </div>
    </div>
  );
}
