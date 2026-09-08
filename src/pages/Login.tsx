import { useState, type FormEvent } from "react";
import { Eye, EyeOff, History, KeyRound, Layers, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import { ThemeMenu } from "../components/ThemeMenu";
import { Field, PrimaryButton, inputClass } from "../components/ui";

const HIGHLIGHTS = [
  {
    icon: Layers,
    title: "Un périmètre clair",
    text: "Ce qui est prévu et ce qui ne l'est pas, consultable à tout moment par l'équipe et le client.",
  },
  {
    icon: ShieldCheck,
    title: "Des validations tracées",
    text: "Chaque décision client est historisée, avec sa date et son auteur — sans ambiguïté.",
  },
  {
    icon: History,
    title: "Un historique complet",
    text: "Qui a fait quoi, et quand : la traçabilité de chaque projet, du premier jour à la livraison.",
  },
];

export function LoginPage() {
  const { signIn, pushToast } = useApp();
  const [email, setEmail] = useState("alice@suiviprojets.fr");
  const [password, setPassword] = useState("suivi-projets");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    signIn();
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex min-h-screen">
        <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-brand p-10 text-white lg:flex xl:w-[38%] xl:p-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-sm font-bold ring-1 ring-white/20">
              SP
            </span>
            <span className="text-base font-bold tracking-tight">Suivi Projets</span>
          </div>

          <div className="relative">
            <h1 className="text-2xl leading-snug font-bold tracking-tight text-balance xl:text-[28px]">
              La source unique de vérité de chaque projet.
            </h1>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/60">
              Prévu, en cours, terminé, bloqué : tout le monde consulte la même information, au même endroit.
            </p>

            <ul className="mt-10 space-y-6">
              {HIGHLIGHTS.map((h) => (
                <li key={h.title} className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
                    <h.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold">{h.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-white/55">{h.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/35">© 2026 Suivi Projets — espace interne</p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="animate-page-in w-full max-w-md">
            <div className="mb-6 flex items-center justify-between lg:mb-8 lg:justify-end">
              <div className="flex items-center gap-3 lg:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
                  SP
                </span>
                <span className="text-base font-bold tracking-tight text-gray-900">Suivi Projets</span>
              </div>
              <ThemeMenu />
            </div>

            <div className="rounded-lg border border-hairline bg-surface p-8 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(15,23,42,0.25)]">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Bon retour parmi nous</h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                Connectez-vous pour retrouver vos projets, vos clients et vos notifications.
              </p>

              <form onSubmit={submit} className="mt-6 grid gap-4">
                <Field label="Email professionnel">
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className={cn(inputClass, "pl-9")}
                    />
                  </div>
                </Field>
                <Field label="Mot de passe">
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className={cn(inputClass, "pl-9 pr-10")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-pressed={showPassword}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
      </div>
    </div>
  );
}
