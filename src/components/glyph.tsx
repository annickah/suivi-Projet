import { Building2, FolderKanban, Info, UserPlus, type LucideIcon } from "lucide-react";
import type { NotificationKind } from "../data";

const GLYPHS: Record<NotificationKind, LucideIcon> = {
  projet: FolderKanban,
  client: Building2,
  utilisateur: UserPlus,
  systeme: Info,
};

export function NotificationGlyph({ kind, className }: { kind: NotificationKind; className?: string }) {
  const Icon = GLYPHS[kind];
  return <Icon className={className} aria-hidden="true" />;
}
