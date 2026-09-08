import { useState, type FormEvent } from "react";
import { Plus, UserPlus } from "lucide-react";
import type { UserRole } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import {
  Avatar,
  Card,
  Field,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  Reveal,
  RoleBadge,
  inputClass,
} from "../components/ui";

const ROLES: UserRole[] = ["Administrateur", "Chef de projet", "Contributeur", "Lecteur"];
const emptyForm = { name: "", email: "", role: "Contributeur" as UserRole };

export function UsersPage() {
  const { users, addUser, toggleUser, pushToast } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    addUser({ name: form.name.trim(), email: form.email.trim(), role: form.role });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${users.length} membres · ${users.filter((u) => u.active).length} actifs`}
        actions={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Inviter un utilisateur
          </PrimaryButton>
        }
      />

      <Reveal className="mt-8">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline bg-gray-50/80 text-xs font-semibold text-gray-500">
                  <th className="px-6 py-3 font-semibold">Utilisateur</th>
                  <th className="px-6 py-3 font-semibold">Rôle</th>
                  <th className="px-6 py-3 font-semibold">Statut</th>
                  <th className="px-6 py-3 font-semibold">Dernière activité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="group transition-colors duration-150 hover:bg-gray-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <p className="font-medium text-gray-900 transition-colors group-hover:text-ink">{u.name}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          toggleUser(u.id);
                          pushToast(u.active ? `Accès suspendu pour ${u.name}` : `Accès réactivé pour ${u.name}`);
                        }}
                        title={u.active ? "Suspendre l'accès" : "Réactiver l'accès"}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-all duration-200 hover:shadow-sm active:scale-[0.97]",
                          u.active
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 ring-slate-500/20 hover:bg-slate-200",
                        )}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full", u.active ? "bg-emerald-500" : "bg-slate-400")}
                          aria-hidden="true"
                        />
                        {u.active ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={90} className="mt-6">
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <UserPlus className="h-3.5 w-3.5" />
          Astuce : cliquez sur la pastille de statut pour suspendre ou réactiver un accès instantanément.
        </p>
      </Reveal>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Inviter un utilisateur"
        description="Un email d'invitation sera envoyé avec le rôle sélectionné."
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>Annuler</GhostButton>
            <button
              type="submit"
              form="new-user-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Envoyer l'invitation
            </button>
          </>
        }
      >
        <form id="new-user-form" onSubmit={submit} className="grid gap-4">
          <Field label="Nom complet">
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Camille Durand"
              className={inputClass}
            />
          </Field>
          <Field label="Email professionnel">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="camille@suiviprojets.fr"
              className={inputClass}
            />
          </Field>
          <Field label="Rôle" hint="Le rôle détermine les permissions sur les projets et les clients.">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className={inputClass}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </form>
      </Modal>
    </>
  );
}
