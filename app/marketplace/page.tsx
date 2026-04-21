"use client";

import { useEffect, useMemo, useState } from "react";

type InventoryItem = {
  instanceId: string;
  itemType: string;
  label: string;
  sprite: string;
  category: string;
  limitedStack: number;
  limitedNumber: number;
};

type MarketRow = {
  itemType: string;
  label: string;
  sprite: string;
  category: string;
  cheapestOfferId: number;
  cheapestPrice: number;
  buyerPrice: number;
  count: number;
  soldToday: number;
  avgPrice7: number;
  latestTimestamp: number;
};

type OwnOffer = {
  offerId: number;
  itemId: string;
  itemType: string;
  label: string;
  sprite: string;
  category: string;
  sellerId: string;
  sellerName: string;
  buyerId: string | null;
  price: number;
  buyerPrice: number;
  timestamp: number;
  soldTimestamp: number;
  state: "OPEN" | "SOLD" | "CLOSED";
  limitedStack: number;
  limitedNumber: number;
};

type RecentSale = {
  saleId: number;
  offerId: number;
  itemType: string;
  label: string;
  sprite: string;
  category: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  price: number;
  buyerPrice: number;
  timestamp: number;
};

type Snapshot = {
  player: {
    id: string;
    name: string;
    ether: number;
    pendingEther: number;
    inventory: InventoryItem[];
    activeOffers: number;
  };
  offers: MarketRow[];
  ownOffers: OwnOffer[];
  recentSales: RecentSale[];
};

const PLAYER_ID = "local-player";

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleString("fr-CA");
}

function categoryColors(category: string) {
  switch (category) {
    case "seating":
      return ["#a88cff", "#6d55c6"];
    case "table":
      return ["#d6b275", "#8b683d"];
    case "office":
      return ["#84b5ff", "#3d6cb0"];
    case "storage":
      return ["#c8b198", "#7b6248"];
    case "bed":
      return ["#ff8ea0", "#aa4455"];
    case "luxury":
      return ["#ffd87f", "#ad7b16"];
    case "tiki":
      return ["#ffbe7f", "#97602a"];
    case "lighting":
      return ["#fff0ab", "#b79635"];
    case "structure":
      return ["#dce2ef", "#7f8da5"];
    default:
      return ["#9ec6ff", "#466b9a"];
  }
}

function ItemBadge({
  label,
  category,
}: {
  label: string;
  category: string;
}) {
  const [top, bottom] = categoryColors(category);

  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 16,
        background: `linear-gradient(180deg, ${top}, ${bottom})`,
        display: "grid",
        placeItems: "center",
        color: "#ffffff",
        fontWeight: 900,
        fontSize: 20,
        letterSpacing: 1,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.24)",
        flexShrink: 0,
      }}
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function MarketplacePage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<
    "price_asc" | "price_desc" | "sold_desc" | "sold_asc" | "count_desc" | "count_asc" | "newest"
  >("price_asc");

  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [sellPrice, setSellPrice] = useState("250");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("playerId", PLAYER_ID);
    params.set("search", search);
    params.set("minPrice", minPrice || "0");
    params.set("maxPrice", maxPrice || "0");
    params.set("sort", sort);
    return params.toString();
  }, [search, minPrice, maxPrice, sort]);

  async function loadSnapshot() {
    setError("");

    try {
      const response = await fetch(`/api/marketplace?${queryString}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Chargement marketplace impossible.");
      }

      setSnapshot(data.snapshot);
      if (!selectedInventoryId && data.snapshot.player.inventory[0]) {
        setSelectedInventoryId(data.snapshot.player.inventory[0].instanceId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function doAction(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: PLAYER_ID,
          ...payload,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Action marketplace refusée.");
      }

      setSnapshot(data.snapshot);
      setNotice(data.notice || "Action réussie.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadSnapshot();
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [queryString]);

  const selectedInventoryItem =
    snapshot?.player.inventory.find((item) => item.instanceId === selectedInventoryId) ?? null;

  const cardStyle: React.CSSProperties = {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.055)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.18)",
    backdropFilter: "blur(10px)",
    padding: 18,
  };

  const pillStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 13,
    fontWeight: 700,
  };

  const buttonStyle: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(180deg, rgba(198,188,255,0.24), rgba(117,103,186,0.22))",
    color: "#f8f6ff",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
  };

  if (loading && !snapshot) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at top, #2f2838 0%, #191720 45%, #0c0d13 100%)",
          color: "#ffffff",
        }}
      >
        Chargement du marketplace EtherWorld...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #322b3d 0%, #1a1822 42%, #0c0d13 100%)",
        color: "#f8f6ff",
        padding: 18,
      }}
    >
      <section
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          display: "grid",
          gap: 14,
        }}
      >
        <header style={{ ...cardStyle, display: "grid", gap: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  opacity: 0.72,
                  marginBottom: 6,
                }}
              >
                EtherWorld / Marketplace
              </div>
              <h1 style={{ margin: 0, fontSize: 32 }}>Bourse des meubles</h1>
              <p style={{ margin: "8px 0 0", opacity: 0.78 }}>
                Vente, achat, annulation et récupération des gains, version locale dev.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                style={buttonStyle}
                onClick={() => void loadSnapshot()}
                disabled={busy}
              >
                Rafraîchir
              </button>

              <button
                type="button"
                style={buttonStyle}
                onClick={() => void doAction({ action: "claim" })}
                disabled={busy}
              >
                Récupérer les gains
              </button>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background:
                    "linear-gradient(180deg, rgba(255,156,156,0.24), rgba(170,63,63,0.22))",
                }}
                onClick={() => void doAction({ action: "reset" })}
                disabled={busy}
              >
                Reset dev
              </button>
            </div>
          </div>

          {snapshot ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={pillStyle}>Joueur: {snapshot.player.name}</div>
              <div style={pillStyle}>Ether: {snapshot.player.ether}</div>
              <div style={pillStyle}>En attente: {snapshot.player.pendingEther}</div>
              <div style={pillStyle}>Inventaire: {snapshot.player.inventory.length}</div>
              <div style={pillStyle}>Offres actives: {snapshot.player.activeOffers}</div>
              <div style={pillStyle}>Marché: {snapshot.offers.length} lignes</div>
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Recherche..."
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.18)",
                color: "#fff",
                padding: "12px 14px",
              }}
            />
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value.replace(/[^\d]/g, ""))}
              placeholder="Prix min"
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.18)",
                color: "#fff",
                padding: "12px 14px",
              }}
            />
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value.replace(/[^\d]/g, ""))}
              placeholder="Prix max"
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.18)",
                color: "#fff",
                padding: "12px 14px",
              }}
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.18)",
                color: "#fff",
                padding: "12px 14px",
              }}
            >
              <option value="price_asc">Prix acheteur ↑</option>
              <option value="price_desc">Prix acheteur ↓</option>
              <option value="sold_desc">Vendus aujourd’hui ↓</option>
              <option value="sold_asc">Vendus aujourd’hui ↑</option>
              <option value="count_desc">Quantité en vente ↓</option>
              <option value="count_asc">Quantité en vente ↑</option>
              <option value="newest">Plus récent</option>
            </select>
          </div>

          {notice ? (
            <div
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                background: "rgba(109, 211, 146, 0.16)",
                border: "1px solid rgba(109, 211, 146, 0.25)",
              }}
            >
              {notice}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                background: "rgba(255, 112, 112, 0.16)",
                border: "1px solid rgba(255, 112, 112, 0.25)",
              }}
            >
              {error}
            </div>
          ) : null}
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "360px minmax(0, 1fr) 360px",
            gap: 14,
            alignItems: "start",
          }}
        >
          <aside style={{ ...cardStyle, display: "grid", gap: 14 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.6,
                  opacity: 0.72,
                  marginBottom: 8,
                }}
              >
                Inventaire vendeur
              </div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Mettre en vente</h2>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {snapshot?.player.inventory.map((item) => {
                const active = item.instanceId === selectedInventoryId;

                return (
                  <button
                    key={item.instanceId}
                    type="button"
                    onClick={() => setSelectedInventoryId(item.instanceId)}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      textAlign: "left",
                      width: "100%",
                      borderRadius: 16,
                      padding: 12,
                      color: "#fff",
                      cursor: "pointer",
                      border: active
                        ? "1px solid rgba(255,255,255,0.26)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: active
                        ? "rgba(187,171,255,0.16)"
                        : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <ItemBadge label={item.label} category={item.category} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.label}</div>
                      <div style={{ opacity: 0.72, fontSize: 13 }}>
                        {item.itemType}
                      </div>
                      <div style={{ opacity: 0.65, fontSize: 12 }}>
                        {item.category}
                      </div>
                    </div>
                  </button>
                );
              })}

              {snapshot && snapshot.player.inventory.length === 0 ? (
                <div style={{ opacity: 0.7 }}>
                  Ton inventaire est vide. Reset dev pour recharger des meubles.
                </div>
              ) : null}
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 800 }}>
                Objet sélectionné: {selectedInventoryItem?.label ?? "Aucun"}
              </div>

              <input
                value={sellPrice}
                onChange={(event) =>
                  setSellPrice(event.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="Prix de vente"
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.18)",
                  color: "#fff",
                  padding: "12px 14px",
                }}
              />

              <button
                type="button"
                style={buttonStyle}
                disabled={busy || !selectedInventoryItem || !sellPrice}
                onClick={() => {
                  if (!selectedInventoryItem) return;
                  void doAction({
                    action: "sell",
                    inventoryId: selectedInventoryItem.instanceId,
                    price: Number(sellPrice || "0"),
                  });
                }}
              >
                Mettre en vente
              </button>

              <div style={{ opacity: 0.68, fontSize: 13 }}>
                L’acheteur paie une commission de 1%.
              </div>
            </div>
          </aside>

          <section style={{ ...cardStyle, display: "grid", gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.6,
                  opacity: 0.72,
                  marginBottom: 8,
                }}
              >
                Bourse EtherWorld
              </div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Offres publiques</h2>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {snapshot?.offers.map((offer) => (
                <article
                  key={`${offer.itemType}-${offer.cheapestOfferId}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px minmax(0, 1fr) auto",
                    gap: 14,
                    alignItems: "center",
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.035)",
                  }}
                >
                  <ItemBadge label={offer.label} category={offer.category} />

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{offer.label}</div>
                    <div style={{ opacity: 0.72, fontSize: 13 }}>{offer.itemType}</div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        marginTop: 8,
                        fontSize: 13,
                        opacity: 0.84,
                      }}
                    >
                      <span>En vente: {offer.count}</span>
                      <span>Vendues ajd: {offer.soldToday}</span>
                      <span>Moyenne 7j: {offer.avgPrice7}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>
                      {offer.buyerPrice} Ether
                    </div>
                    <div style={{ opacity: 0.65, fontSize: 12 }}>
                      vendeur: {offer.cheapestPrice}
                    </div>
                    <button
                      type="button"
                      style={buttonStyle}
                      disabled={busy}
                      onClick={() =>
                        void doAction({
                          action: "buy",
                          offerId: offer.cheapestOfferId,
                        })
                      }
                    >
                      Acheter
                    </button>
                  </div>
                </article>
              ))}

              {snapshot && snapshot.offers.length === 0 ? (
                <div style={{ opacity: 0.72 }}>Aucune offre avec ces filtres.</div>
              ) : null}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14 }}>
            <section style={{ ...cardStyle, display: "grid", gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1.6,
                    opacity: 0.72,
                    marginBottom: 8,
                  }}
                >
                  Mes offres
                </div>
                <h2 style={{ margin: 0, fontSize: 22 }}>Actives</h2>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {snapshot?.ownOffers.map((offer) => (
                  <article
                    key={offer.offerId}
                    style={{
                      borderRadius: 16,
                      padding: 12,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <ItemBadge label={offer.label} category={offer.category} />
                      <div>
                        <div style={{ fontWeight: 800 }}>{offer.label}</div>
                        <div style={{ opacity: 0.7, fontSize: 13 }}>
                          Vente: {offer.price} / Acheteur: {offer.buyerPrice}
                        </div>
                      </div>
                    </div>

                    <div style={{ opacity: 0.65, fontSize: 12 }}>
                      Ouverte le {formatDate(offer.timestamp)}
                    </div>

                    <button
                      type="button"
                      style={buttonStyle}
                      disabled={busy}
                      onClick={() =>
                        void doAction({
                          action: "cancel",
                          offerId: offer.offerId,
                        })
                      }
                    >
                      Retirer du marché
                    </button>
                  </article>
                ))}

                {snapshot && snapshot.ownOffers.length === 0 ? (
                  <div style={{ opacity: 0.72 }}>Aucune offre active.</div>
                ) : null}
              </div>
            </section>

            <section style={{ ...cardStyle, display: "grid", gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1.6,
                    opacity: 0.72,
                    marginBottom: 8,
                  }}
                >
                  Dernières ventes
                </div>
                <h2 style={{ margin: 0, fontSize: 22 }}>Historique</h2>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {snapshot?.recentSales.map((sale) => (
                  <article
                    key={sale.saleId}
                    style={{
                      borderRadius: 16,
                      padding: 12,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <ItemBadge label={sale.label} category={sale.category} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{sale.label}</div>
                      <div style={{ opacity: 0.72, fontSize: 13 }}>
                        {sale.sellerName} → {sale.buyerName}
                      </div>
                      <div style={{ opacity: 0.66, fontSize: 12 }}>
                        vendeur: {sale.price} / acheteur: {sale.buyerPrice}
                      </div>
                    </div>
                  </article>
                ))}

                {snapshot && snapshot.recentSales.length === 0 ? (
                  <div style={{ opacity: 0.72 }}>Aucune vente récente.</div>
                ) : null}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
