import { CheckCheck, Clock, Trash2 } from "lucide-react";
import { timeAgo } from "../data";
import { useApp, useNow } from "../store";
import { cn } from "../utils/cn";
import { NotificationGlyph } from "../components/glyph";
import { Card, GhostButton, Reveal } from "../components/ui";

const iconBtn =
  "rounded-md p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700";

export function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead, removeNotification, clearNotifications } =
    useApp();
  const now = useNow();

  return (
    <>
      <h1 className="text-xl font-bold tracking-tight text-gray-900">Notifications</h1>

      {notifications.length === 0 ? (
        <Card className="mt-8 px-6 py-5">
          <p className="text-sm text-gray-500">Aucune notification.</p>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-gray-500">
                {notifications.length} notification{notifications.length > 1 ? "s" : ""} ·{" "}
                <span className={cn(unreadCount > 0 && "font-medium text-gray-800")}>
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <GhostButton onClick={markAllRead}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tout marquer comme lu
                </GhostButton>
                <GhostButton onClick={clearNotifications}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Tout effacer
                </GhostButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <Card className="divide-y divide-gray-100 overflow-hidden">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group flex items-start gap-4 px-6 py-4 transition-colors duration-150 hover:bg-gray-50/80",
                    !n.read && "bg-slate-50/70",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      n.read ? "bg-gray-100 text-gray-500" : "bg-ink text-white",
                    )}
                  >
                    <NotificationGlyph kind={n.kind} className="h-4 w-4" />
                  </span>

                  <button type="button" onClick={() => markRead(n.id)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-gray-600">{n.message}</span>
                    <span className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {timeAgo(n.at, now)}
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100">
                    {!n.read && (
                      <button
                        type="button"
                        title="Marquer comme lue"
                        aria-label={`Marquer « ${n.title} » comme lue`}
                        onClick={() => markRead(n.id)}
                        className={iconBtn}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Supprimer"
                      aria-label={`Supprimer « ${n.title} »`}
                      onClick={() => removeNotification(n.id)}
                      className={cn(iconBtn, "hover:bg-red-50 hover:text-red-600")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </Reveal>
        </div>
      )}
    </>
  );
}
