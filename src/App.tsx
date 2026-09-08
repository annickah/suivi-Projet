import { AppProvider, useApp } from "./store";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Toasts } from "./components/ui";
import { DashboardPage } from "./pages/Dashboard";
import { ProjectsPage } from "./pages/Projects";
import { ClientsPage } from "./pages/Clients";
import { UsersPage } from "./pages/Users";
import { NotificationsPage } from "./pages/Notifications";
import { LoginPage } from "./pages/Login";
import { ProjectDetailPage } from "./pages/ProjectDetail";
import { PortalPage } from "./pages/Portal";

function CurrentPage() {
  const { route } = useApp();
  switch (route) {
    case "tableau-de-bord":
      return <DashboardPage />;
    case "projets":
      return <ProjectsPage />;
    case "clients":
      return <ClientsPage />;
    case "utilisateurs":
      return <UsersPage />;
    case "notifications":
    default:
      return <NotificationsPage />;
  }
}

function Shell() {
  const { route, projectView, portal } = useApp();
  const viewKey = portal
    ? `portail-${portal.clientId}-${portal.projectId}`
    : projectView
      ? `projet-${projectView}`
      : route;
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar />
        <main key={viewKey} className="animate-page-in flex-1 px-4 py-6 sm:px-6">
          {portal ? <PortalPage /> : projectView ? <ProjectDetailPage /> : <CurrentPage />}
        </main>
      </div>
    </div>
  );
}

function Root() {
  const { signedIn } = useApp();
  return (
    <>
      {signedIn ? <Shell /> : <LoginPage />}
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
