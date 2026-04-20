import { FURNITURE_ORDER, type ActionLog, type FurnitureKind } from "@/lib/iso/types";

type AdminPanelProps = {
  visible: boolean;
  logs: ActionLog[];
  onSpawnFurniture: (type: FurnitureKind) => void;
  onDeleteSelected: () => void;
  onRotateSelected: () => void;
  onTeleportCenter: () => void;
  onRetheme: () => void;
};

const ADMIN_ITEMS: FurnitureKind[] = FURNITURE_ORDER;

export function AdminPanel({
  visible,
  logs,
  onSpawnFurniture,
  onDeleteSelected,
  onRotateSelected,
  onTeleportCenter,
  onRetheme
}: AdminPanelProps) {
  if (!visible) {
    return null;
  }

  return (
    <section className="glass-panel card" style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <span className="badge mono">Admin control</span>
        <h3>Console Ether</h3>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
          Gestion directe des meubles, du theme et des deplacements avatar.
        </p>
      </div>
      <div className="toolbar">
        {ADMIN_ITEMS.map((item) => (
          <button className="button-secondary" key={item} onClick={() => onSpawnFurniture(item)} type="button">
            + {item}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <button className="button-secondary" onClick={onRotateSelected} type="button">
          Rotation
        </button>
        <button className="button-danger" onClick={onDeleteSelected} type="button">
          Supprimer
        </button>
        <button className="button-secondary" onClick={onTeleportCenter} type="button">
          Teleporter au centre
        </button>
        <button className="button-secondary" onClick={onRetheme} type="button">
          Changer l'ambiance
        </button>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <h4>Logs d'actions</h4>
        <div className="log-list">
          {logs.map((entry) => (
            <div className="log-entry" key={entry.id}>
              <div style={{ fontSize: "0.9rem" }}>{entry.action}</div>
              <div className="muted mono" style={{ fontSize: "0.76rem", marginTop: 4 }}>
                {entry.actor} / {new Date(entry.createdAt).toLocaleString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
