import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ROUTES,
  seedClients,
  seedProjects,
  seedUsers,
  type AppNotification,
  type Client,
  type NotificationKind,
  type Project,
  type RouteId,
  type Toast,
  type User,
} from "./data";
import { seedEvents, type ProjectEvent, type ProjectEventType } from "./history";
import {
  seedDocuments,
  seedPerimeters,
  seedRequests,
  seedScope,
  seedTaskComments,
  seedTasks,
  seedValidations,
  type ChangeRequest,
  type Perimeter,
  type ProjectDoc,
  type RequestStatus,
  type ScopeItem,
  type Task,
  type TaskComment,
  type TaskPriority,
  type Validation,
  type ValidationStatus,
} from "./project";

function parseHash(): RouteId {
  const h = window.location.hash.replace(/^#\/?/, "");
  return (ROUTES.find((r) => r.id === h)?.id ?? "notifications") as RouteId;
}

export type ThemeMode = "system" | "light" | "dark";
const THEME_STORAGE_KEY = "suivi-projets-theme";

function readStoredTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // stockage indisponible (navigation privée…) : on retombe sur le système
  }
  return "system";
}

interface AppState {
  route: RouteId;
  navigate: (r: RouteId) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  isDark: boolean;
  signedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (kind: NotificationKind, title: string, message: string) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
  projects: Project[];
  addProject: (p: Omit<Project, "id" | "members" | "progress">) => void;
  updateProject: (id: number, patch: Partial<Project>, ev: { type: ProjectEventType; message: string }) => void;
  clients: Client[];
  addClient: (c: Omit<Client, "id" | "since">) => void;
  users: User[];
  addUser: (u: Omit<User, "id" | "active" | "lastActive">) => void;
  toggleUser: (id: number) => void;
  events: ProjectEvent[];
  tasks: Task[];
  toggleTask: (id: number) => void;
  addTask: (projectId: number, t: { label: string; phase: string; assignee: string; due: string; description?: string; priority?: TaskPriority; tags?: string[] }) => void;
  updateTask: (id: number, patch: Partial<Omit<Task, "id" | "projectId">>) => void;
  deleteTask: (id: number) => void;
  taskComments: TaskComment[];
  addTaskComment: (taskId: number, text: string, author: string) => void;
  deleteTaskComment: (id: number) => void;
  validations: Validation[];
  decideValidation: (id: number, decision: "validee" | "refusee", actor: string) => void;
  setValidationStatus: (id: number, status: ValidationStatus, actor: string) => void;
  addValidation: (projectId: number, v: { label: string; approver: string; date: string }) => void;
  requests: ChangeRequest[];
  addRequest: (projectId: number, r: { title: string; description: string; author: string }) => void;
  decideRequest: (id: number, decision: Exclude<RequestStatus, "en-attente">) => void;
  documents: ProjectDoc[];
  addDocument: (projectId: number, d: { name: string; kind: ProjectDoc["kind"]; size: string; shared: boolean }) => void;
  scope: ScopeItem[];
  addScope: (projectId: number, label: string) => void;
  perimeter: Record<number, Perimeter>;
  updatePerimeter: (projectId: number, patch: Partial<Omit<Perimeter, "projectId">>) => void;
  projectView: number | null;
  openProject: (id: number) => void;
  closeProject: () => void;
  portal: { clientId: number; projectId: number } | null;
  openPortal: (clientId: number, projectId?: number) => void;
  closePortal: () => void;
  toasts: Toast[];
  pushToast: (message: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return v;
}

let uid = 100;
const nextId = () => ++uid;

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteId>(() => parseHash());
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme());
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [signedIn, setSignedIn] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [events, setEvents] = useState<ProjectEvent[]>(seedEvents);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [taskComments, setTaskComments] = useState<TaskComment[]>(seedTaskComments);
  const [validations, setValidations] = useState<Validation[]>(seedValidations);
  const [requests, setRequests] = useState<ChangeRequest[]>(seedRequests);
  const [documents, setDocuments] = useState<ProjectDoc[]>(seedDocuments);
  const [scope, setScope] = useState<ScopeItem[]>(seedScope);
  const [perimeter, setPerimeter] = useState<Record<number, Perimeter>>(() => {
    const m: Record<number, Perimeter> = {};
    for (const p of seedPerimeters) m[p.projectId] = p;
    return m;
  });
  const [projectView, setProjectView] = useState<number | null>(null);
  const [portal, setPortal] = useState<{ clientId: number; projectId: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // stockage indisponible : le choix reste actif pour la session en cours
    }
  }, []);

  // Applique (ou retire) data-theme sur <html> : c'est ce sélecteur que lit
  // index.css pour faire primer un choix explicite sur la préférence système.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  useEffect(() => {
    const label = ROUTES.find((r) => r.id === route)?.label ?? "Notifications";
    document.title = `Suivi Projets — ${label}`;
  }, [route]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const navigate = useCallback((r: RouteId) => {
    window.location.hash = `/${r}`;
    setRoute(r);
    setMenuOpen(false);
    setProjectView(null);
    setPortal(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const pushToast = useCallback((message: string) => {
    const id = nextId();
    setToasts((t) => [...t, { id, message }]);
    const timer = window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
    timers.current.push(timer);
  }, []);

  const addNotification = useCallback((kind: NotificationKind, title: string, message: string) => {
    setNotifications((n) => [{ id: nextId(), kind, title, message, at: Date.now(), read: false }, ...n]);
  }, []);

  const markRead = useCallback((id: number) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }, []);
  const markAllRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, read: true }))), []);
  const removeNotification = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);
  const clearNotifications = useCallback(() => setNotifications([]), []);

  const pushEvent = useCallback((projectId: number, type: ProjectEventType, message: string, author = "Alice Admin") => {
    setEvents((list) => [
      { id: nextId(), projectId, at: new Date().toISOString(), author, type, message },
      ...list,
    ]);
  }, []);

  const addProject = useCallback(
    (p: Omit<Project, "id" | "members" | "progress">) => {
      const id = nextId();
      setProjects((list) => [{ ...p, id, progress: 0, members: 2 + (p.name.length % 5) }, ...list]);
      pushEvent(id, "creation", `Projet créé et rattaché au client ${p.client}.`);
      addNotification("projet", "Projet créé", `« ${p.name} » a été ajouté au portefeuille.`);
      pushToast(`Projet « ${p.name} » créé`);
    },
    [addNotification, pushEvent, pushToast],
  );

  const updateProject = useCallback(
    (id: number, patch: Partial<Project>, ev: { type: ProjectEventType; message: string }) => {
      setProjects((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      pushEvent(id, ev.type, ev.message);
      if (ev.type === "statut") addNotification("projet", "Statut mis à jour", ev.message);
    },
    [addNotification, pushEvent],
  );

  const addClient = useCallback(
    (c: Omit<Client, "id" | "since">) => {
      setClients((list) => [{ ...c, id: nextId(), since: new Date().toISOString().slice(0, 10) }, ...list]);
      addNotification("client", "Client ajouté", `${c.name} rejoint le portefeuille clients.`);
      pushToast(`Client « ${c.name} » ajouté`);
    },
    [addNotification, pushToast],
  );

  const addUser = useCallback(
    (u: Omit<User, "id" | "active" | "lastActive">) => {
      setUsers((list) => [...list, { ...u, id: nextId(), active: true, lastActive: "À l'instant" }]);
      addNotification("utilisateur", "Invitation envoyée", `${u.name} (${u.role}) a été invité·e sur l'espace.`);
      pushToast(`Invitation envoyée à ${u.email}`);
    },
    [addNotification, pushToast],
  );

  const toggleUser = useCallback((id: number) => {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  }, []);

  function computeProgress(projectId: number, taskList: Task[]): number {
    const projectTasks = taskList.filter((t) => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const done = projectTasks.filter((t) => t.done).length;
    return Math.round((done / projectTasks.length) * 100);
  }

  const toggleTask = useCallback(
    (id: number) => {
      let affectedProjectId: number | null = null;
      let nextDone = false;
      setTasks((list) =>
        list.map((t) => {
          if (t.id !== id) return t;
          affectedProjectId = t.projectId;
          nextDone = !t.done;
          pushEvent(t.projectId, "tache", nextDone ? `Tâche terminée : « ${t.label} ».` : `Tâche rouverte : « ${t.label} ».`);
          return { ...t, done: nextDone };
        }),
      );
      if (affectedProjectId !== null) {
        const pid = affectedProjectId;
        setTasks((list) => {
          const newProgress = computeProgress(pid, list);
          setProjects((prev) => {
            const project = prev.find((p) => p.id === pid);
            if (!project || project.progress === newProgress) return prev;
            pushEvent(pid, "progression", `Progression recalculée à partir des tâches : ${project.progress} % → ${newProgress} %.`);
            return prev.map((p) => (p.id === pid ? { ...p, progress: newProgress } : p));
          });
          return list;
        });
      }
    },
    [pushEvent],
  );

  const addTask = useCallback(
    (projectId: number, t: { label: string; phase: string; assignee: string; due: string; description?: string; priority?: TaskPriority; tags?: string[] }) => {
      setTasks((list) => {
        const next = [
          ...list,
          {
            ...t,
            id: nextId(),
            projectId,
            done: false,
            description: t.description ?? "",
            priority: t.priority ?? ("normale" as TaskPriority),
            tags: t.tags ?? [],
          },
        ];
        const newProgress = computeProgress(projectId, next);
        setProjects((prev) => {
          const project = prev.find((p) => p.id === projectId);
          if (!project || project.progress === newProgress) return prev;
          pushEvent(projectId, "progression", `Progression recalculée à partir des tâches : ${project.progress} % → ${newProgress} %.`);
          return prev.map((p) => (p.id === projectId ? { ...p, progress: newProgress } : p));
        });
        return next;
      });
      pushEvent(projectId, "tache", `Nouvelle tâche ajoutée (${t.phase}) : « ${t.label} ».`);
      pushToast(`Tâche « ${t.label} » ajoutée`);
    },
    [pushEvent, pushToast],
  );

  const updateTask = useCallback(
    (id: number, patch: Partial<Omit<Task, "id" | "projectId">>) => {
      let projectId: number | null = null;
      setTasks((list) => {
        const next = list.map((t) => {
          if (t.id !== id) return t;
          projectId = t.projectId;
          return { ...t, ...patch };
        });
        if (projectId !== null && patch.done !== undefined) {
          const pid = projectId;
          const newProgress = computeProgress(pid, next);
          setProjects((prev) => {
            const project = prev.find((p) => p.id === pid);
            if (!project || project.progress === newProgress) return prev;
            pushEvent(pid, "progression", `Progression recalculée à partir des tâches : ${project.progress} % → ${newProgress} %.`);
            return prev.map((p) => (p.id === pid ? { ...p, progress: newProgress } : p));
          });
        }
        return next;
      });
      if (projectId !== null) {
        const pid = projectId;
        pushEvent(pid, "tache", `Tâche mise à jour : « ${patch.label ?? "(mise à jour)"} ».`);
      }
    },
    [pushEvent],
  );

  const deleteTask = useCallback(
    (id: number) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      setTasks((list) => list.filter((t) => t.id !== id));
      setTaskComments((list) => list.filter((c) => c.taskId !== id));
      const newProgress = computeProgress(task.projectId, tasks.filter((t) => t.id !== id));
      setProjects((prev) => {
        const project = prev.find((p) => p.id === task.projectId);
        if (!project || project.progress === newProgress) return prev;
        pushEvent(task.projectId, "progression", `Progression recalculée à partir des tâches : ${project.progress} % → ${newProgress} %.`);
        return prev.map((p) => (p.id === task.projectId ? { ...p, progress: newProgress } : p));
      });
      pushEvent(task.projectId, "tache", `Tâche supprimée : « ${task.label} ».`);
      pushToast(`Tâche « ${task.label} » supprimée`);
    },
    [pushEvent, pushToast, tasks],
  );

  const addTaskComment = useCallback(
    (taskId: number, text: string, author: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      let projectId: number | null = null;
      setTaskComments((list) => {
        const found = tasks.find((t) => t.id === taskId);
        projectId = found?.projectId ?? null;
        return [...list, { id: nextId(), taskId, author, text: trimmed, at: new Date().toISOString() }];
      });
      if (projectId !== null) {
        const pid = projectId;
        pushEvent(pid, "commentaire", `Commentaire ajouté sur la tâche #${taskId} par ${author}.`);
      }
    },
    [pushEvent, tasks],
  );

  const deleteTaskComment = useCallback(
    (id: number) => {
      setTaskComments((list) => list.filter((c) => c.id !== id));
    },
    [],
  );

  const decideValidation = useCallback(
    (id: number, decision: "validee" | "refusee", actor: string) => {
      setValidations((list) =>
        list.map((v) => {
          if (v.id !== id) return v;
          const message =
            decision === "validee"
              ? `Validation « ${v.label} » acceptée par ${actor}.`
              : `Validation « ${v.label} » : demande de modification par ${actor}.`;
          pushEvent(v.projectId, "validation", message, actor);
          addNotification("projet", decision === "validee" ? "Livrables validés" : "Modification demandée", message);
          pushToast(message);
          return { ...v, status: decision };
        }),
      );
    },
    [addNotification, pushEvent, pushToast],
  );

  const addValidation = useCallback(
    (projectId: number, v: { label: string; approver: string; date: string }) => {
      setValidations((list) => [...list, { ...v, id: nextId(), projectId, status: "en-attente" as ValidationStatus }]);
      pushEvent(projectId, "validation", `Nouvelle validation ajoutée : « ${v.label} » (approbateur : ${v.approver}).`);
      pushToast(`Validation « ${v.label} » ajoutée`);
    },
    [pushEvent, pushToast],
  );

  const setValidationStatus = useCallback(
    (id: number, status: ValidationStatus, actor: string) => {
      const STATUS_LABEL: Record<ValidationStatus, string> = {
        "validee": "Validée",
        "en-attente": "Remise en attente",
        "a-venir": "Remise à venir",
        "refusee": "Marquée comme refusée",
      };
      setValidations((list) =>
        list.map((v) => {
          if (v.id !== id) return v;
          const message = `Validation « ${v.label} » : ${STATUS_LABEL[status].toLowerCase()} par ${actor}.`;
          pushEvent(v.projectId, "validation", message, actor);
          pushToast(`${STATUS_LABEL[status]} — « ${v.label} »`);
          return { ...v, status };
        }),
      );
    },
    [pushEvent, pushToast],
  );

  const addRequest = useCallback(
    (projectId: number, r: { title: string; description: string; author: string }) => {
      setRequests((list) => [
        { ...r, id: nextId(), projectId, at: new Date().toISOString(), status: "en-attente" as RequestStatus },
        ...list,
      ]);
      pushEvent(projectId, "demande", `Demande de modification soumise : « ${r.title} ».`, r.author);
      addNotification("projet", "Nouvelle demande de modification", `« ${r.title} » — à instruire par l'équipe projet.`);
      pushToast("Demande de modification envoyée à l'équipe projet");
    },
    [addNotification, pushEvent, pushToast],
  );

  const decideRequest = useCallback(
    (id: number, decision: Exclude<RequestStatus, "en-attente">) => {
      // Règle §7.4 du cahier des charges : une demande de modification ne doit
      // jamais modifier automatiquement le périmètre, même une fois acceptée.
      // Étendre le périmètre reste une action explicite et distincte, via
      // updatePerimeter / addScope depuis l'onglet Périmètre.
      setRequests((list) =>
        list.map((r) => {
          if (r.id !== id) return r;
          pushEvent(
            r.projectId,
            "demande",
            `Demande « ${r.title} » ${decision === "acceptee" ? "acceptée" : "refusée"} par Alice Admin.`,
          );
          addNotification(
            "projet",
            decision === "acceptee" ? "Demande acceptée" : "Demande refusée",
            `« ${r.title} » a été ${decision === "acceptee" ? "acceptée — à intégrer explicitement au périmètre si besoin" : "refusée"}.`,
          );
          pushToast(decision === "acceptee" ? `Demande « ${r.title} » acceptée` : `Demande « ${r.title} » refusée`);
          return { ...r, status: decision };
        }),
      );
    },
    [addNotification, pushEvent, pushToast],
  );

  const addDocument = useCallback(
    (projectId: number, d: { name: string; kind: ProjectDoc["kind"]; size: string; shared: boolean }) => {
      setDocuments((list) => [
        { ...d, id: nextId(), projectId, by: "Alice Admin", at: new Date().toISOString().slice(0, 10) },
        ...list,
      ]);
      pushEvent(
        projectId,
        "document",
        d.shared ? `Document partagé avec le client : « ${d.name} ».` : `Document ajouté (interne) : « ${d.name} ».`,
      );
      pushToast(`Document « ${d.name} » ajouté`);
    },
    [pushEvent, pushToast],
  );

   const addScope = useCallback(
    (projectId: number, label: string) => {
      setScope((list) => [...list, { id: nextId(), projectId, label, status: "inclus" }]);
      pushEvent(projectId, "perimetre", `Périmètre mis à jour : « ${label} » ajouté.`);
      pushToast("Périmètre mis à jour");
    },
    [pushEvent, pushToast],
  );

  const updatePerimeter = useCallback((projectId: number, patch: Partial<Omit<Perimeter, "projectId">>) => {
    setPerimeter((map) => ({ ...map, [projectId]: { ...(map[projectId] ?? { projectId, description: "", objectives: "", plannedPages: "", plannedFeatures: "", includedElements: "", excludedElements: "" }), ...patch } }));
    pushEvent(projectId, "perimetre", `Périmètre du projet mis à jour.`);
    pushToast("Périmètre enregistré");
  }, [pushEvent, pushToast]);

  const openProject = useCallback((id: number) => {
    setProjectView(id);
    setPortal(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const closeProject = useCallback(() => setProjectView(null), []);

  const openPortal = useCallback((clientId: number, projectId?: number) => {
    setPortal((prev) => ({ clientId, projectId: projectId ?? prev?.projectId ?? 0 }));
    setProjectView(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const closePortal = useCallback(() => setPortal(null), []);

  const signIn = useCallback(() => {
    setSignedIn(true);
    pushToast("Bon retour, Alice Admin");
  }, [pushToast]);
  const signOut = useCallback(() => {
    setSignedIn(false);
    setMenuOpen(false);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value: AppState = {
    route,
    navigate,
    menuOpen,
    setMenuOpen,
    theme,
    setTheme,
    isDark,
    signedIn,
    signIn,
    signOut,
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    removeNotification,
    clearNotifications,
    projects,
    addProject,
    updateProject,
    clients,
    addClient,
    users,
    addUser,
    toggleUser,
    events,
    tasks,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    taskComments,
    addTaskComment,
    deleteTaskComment,
    validations,
    decideValidation,
    setValidationStatus,
    addValidation,
    requests,
    addRequest,
    decideRequest,
    documents,
    addDocument,
     scope,
     addScope,
     perimeter,
     updatePerimeter,
    projectView,
    openProject,
    closeProject,
    portal,
    openPortal,
    closePortal,
    toasts,
    pushToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
