import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  SearchX,
} from "lucide-react";
import { formatDate } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import {
  Avatar,
  Card,
  EmptyState,
  Field,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  Reveal,
  inputClass,
} from "../components/ui";

const emptyForm = { name: "", contact: "", email: "", phone: "", city: "" };
type ClientSortField = "name" | "contact" | "projects" | "since";

export function ClientsPage() {
  const { clients, projects, addClient, openPortal } = useApp();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<ClientSortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const projectCount = (name: string) => projects.filter((p) => p.client === name).length;

  const handleSort = (field: ClientSortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = clients.filter(
      (c) =>
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q),
    );
    return list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "contact") cmp = a.contact.localeCompare(b.contact);
      else if (sortField === "projects") cmp = projectCount(a.name) - projectCount(b.name);
      else if (sortField === "since") cmp = Date.parse(a.since) - Date.parse(b.since);
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [clients, query, sortField, sortOrder, projects]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addClient({
      name: form.name.trim(),
      contact: form.contact.trim() || "Contact principal",
      email: form.email.trim() || `contact@${form.name.trim().toLowerCase().replace(/\s+/g, "-")}.fr`,
      phone: form.phone.trim() || "—",
      city: form.city.trim() || "France",
    });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} comptes actifs · ${projects.length} projets rattachés`}
        actions={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Nouveau client
          </PrimaryButton>
        }
      />

      <Reveal className="mt-8">
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un client, un contact, une ville…"
              aria-label="Rechercher un client"
              className={cn(inputClass, "pl-9")}
            />
          </div>
          <span className="text-xs text-gray-500">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </Card>
      </Reveal>

      <Reveal delay={90} className="mt-6">
        <Card className="overflow-hidden">
          {/* Vue mobile en cartes */}
          <div className="divide-y divide-gray-100 sm:hidden">
            {filtered.map((c) => {
              const first = projects.find((p) => p.client === c.name);
              const count = projectCount(c.name);
              return (
                <div key={c.id} className="p-4 space-y-3 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {c.city}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-ink">
                      {count} projet{count > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 bg-gray-50/60 rounded-md p-2.5">
                    <p className="font-medium text-gray-800">{c.contact}</p>
                    <p className="flex items-center gap-1.5 text-gray-500">
                      <Mail className="h-3 w-3" />
                      {c.email}
                    </p>
                    {c.phone !== "—" && (
                      <p className="flex items-center gap-1.5 text-gray-500">
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </p>
                    )}
                  </div>

                  {first && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => openPortal(c.id, first.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-ink hover:border-gray-300 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ouvrir l'espace client
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <EmptyState
                icon={SearchX}
                title="Aucun client ne correspond à votre recherche"
                hint="Essayez un autre nom, un contact ou une ville."
              />
            )}
          </div>

          {/* Vue tableau sur tablette et bureau */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline bg-gray-50/80 text-xs font-semibold text-gray-500">
                  <th className="px-6 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("name")}
                      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Client
                      {sortField === "name" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-ink" /> : <ArrowDown className="h-3 w-3 text-ink" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("contact")}
                      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Contact
                      {sortField === "contact" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-ink" /> : <ArrowDown className="h-3 w-3 text-ink" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 font-semibold">Coordonnées</th>
                  <th className="px-6 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("projects")}
                      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Projets
                      {sortField === "projects" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-ink" /> : <ArrowDown className="h-3 w-3 text-ink" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("since")}
                      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Client depuis
                      {sortField === "since" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-ink" /> : <ArrowDown className="h-3 w-3 text-ink" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 font-semibold">Espace client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => {
                  const first = projects.find((p) => p.client === c.name);
                  const count = projectCount(c.name);
                  return (
                    <tr key={c.id} className="group transition-colors duration-150 hover:bg-gray-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} />
                          <div>
                            <p className="font-medium text-gray-900 transition-colors group-hover:text-ink">{c.name}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {c.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{c.contact}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {c.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink tabular-nums">
                          {count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(c.since)}</td>
                      <td className="px-6 py-4">
                        {first ? (
                          <button
                            type="button"
                            onClick={() => openPortal(c.id, first.id)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-ink active:scale-[0.98]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ouvrir le suivi
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Aucun projet</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={SearchX}
                        title="Aucun client ne correspond à votre recherche"
                        hint="Essayez un autre nom, un contact ou une ville."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouveau client"
        description="Le compte client sera créé et rattachable à vos projets."
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>Annuler</GhostButton>
            <button
              type="submit"
              form="new-client-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <Building2 className="h-3.5 w-3.5" />
              Créer le client
            </button>
          </>
        }
      >
        <form id="new-client-form" onSubmit={submit} className="grid gap-4">
          <Field label="Raison sociale">
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Maison Verdier"
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact principal">
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Prénom Nom"
                className={inputClass}
              />
            </Field>
            <Field label="Ville">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex. Lyon"
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@entreprise.fr"
                className={inputClass}
              />
            </Field>
            <Field label="Téléphone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="04 00 00 00 00"
                className={inputClass}
              />
            </Field>
          </div>
        </form>
      </Modal>
    </>
  );
}
