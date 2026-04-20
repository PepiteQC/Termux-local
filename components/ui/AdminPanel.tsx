import { TouchButton } from "@/components/ui/TouchButton";
import { FURNITURE_ORDER, type ActionLog, type FurnitureKind } from "@/lib/iso/types";

type AdminPanelProps = {
  visible: boolean;
  logs: ActionLog[];
  onSpawnFurniture: (type: FurnitureKind) => void;
  onDeleteSelected: () => void;
  onRotateSelected: () => void;
  onTeleportCenter: () => void;
};

export function AdminPanel({
  visible,
  logs,
  onSpawnFurniture,
  onDeleteSelected,
  onRotateSelected,
  onTeleportCenter
}: AdminPanelProps) {
  if (!visible) {
    return null;
  }

  return (
    <section className="glass-panel mobile-card">
      <div className="panel-heading">
        <span className="badge mono">Admin</span>
        <h3>Controle Ether</h3>
      </div>
      <div className="touch-grid">
        {FURNITURE_ORDER.map((item) => (
          <TouchButton key={item} onClick={() => onSpawnFurniture(item)}>
            + {item}
          </TouchButton>
        ))}
      </div>
      <div className="touch-grid">
        <TouchButton onClick={onRotateSelected}>Rotation</TouchButton>
        <TouchButton onClick={onDeleteSelected} variant="danger">
          Supprimer
        </TouchButton>
        <TouchButton onClick={onTeleportCenter}>Teleport</TouchButton>
      </div>
      <div className="log-stack">
        {logs.slice(0, 6).map((entry) => (
          <div className="log-entry" key={entry.id}>
            <strong>{entry.action}</strong>
            <span className="muted mono">{entry.actor}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
