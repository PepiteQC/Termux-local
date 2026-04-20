"use client";

import { useEffect, useState } from "react";

import { FurnitureLayer } from "../../components/FurnitureLayer";

type RoomPreset = {
  id: string;
  name: string;
  tagline: string;
  theme: string;
  occupancy: string;
};

type AssetCard = {
  id: string;
  name: string;
  category: string;
  path: string;
  meta?: string;
};

type GameContent = {
  rooms: RoomPreset[];
  avatars: AssetCard[];
  wardrobe: AssetCard[];
  shopItems: AssetCard[];
  furnitures: AssetCard[];
  furnitureData: Array<{
    id: string;
    label: string;
    category: string;
    spritePath: string;
    dimensions: { width: number; depth: number; height: number };
    states: string[];
    defaultState: string;
    particleEffect: string | null;
    price: number;
    rarity: string;
  }>;
  catalogItems: Array<{
    id: string;
    name: string;
    kind: string;
    refId: string;
    category: string;
    price: number;
    rarity: string;
    spritePath: string;
    tags: string[];
  }>;
  discoveredFiles: string[];
};

type RightTab = "wardrobe" | "shop" | "assets";

function AssetGrid({
  items,
  selectedId,
  onSelect
}: {
  items: AssetCard[];
  selectedId: string;
  onSelect: (item: AssetCard) => void;
}) {
  return (
    <div className="ew-asset-grid">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`ew-asset-card ${selectedId === item.id ? "active" : ""}`}
          onClick={() => onSelect(item)}
        >
          <img src={item.path} alt={item.name} />
          <strong>{item.name}</strong>
          <span>{item.meta ?? item.category}</span>
        </button>
      ))}
    </div>
  );
}

export default function RoomPage() {
  const [content, setContent] = useState<GameContent | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomPreset | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AssetCard | null>(null);
  const [selectedWardrobe, setSelectedWardrobe] = useState<AssetCard | null>(null);
  const [selectedShopItem, setSelectedShopItem] = useState<AssetCard | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<AssetCard | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("wardrobe");
  const [showShop, setShowShop] = useState(false);
  const [loadingState, setLoadingState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const response = await fetch("/api/game-content", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load game content");
        }

        const nextContent = (await response.json()) as GameContent;
        if (!active) {
          return;
        }

        setContent(nextContent);
        setSelectedRoom(nextContent.rooms[0] ?? null);
        setSelectedAvatar(nextContent.avatars[0] ?? null);
        setSelectedWardrobe(nextContent.wardrobe[0] ?? null);
        setSelectedShopItem(nextContent.shopItems[0] ?? null);
        setSelectedFurniture(nextContent.furnitures[0] ?? null);
        setLoadingState("ready");
      } catch {
        if (active) {
          setLoadingState("error");
        }
      }
    };

    void loadContent();

    return () => {
      active = false;
    };
  }, []);

  if (loadingState === "loading" || !content || !selectedRoom || !selectedAvatar || !selectedWardrobe || !selectedShopItem || !selectedFurniture) {
    return (
      <main className="ew-room-page">
        <section className="ew-shell-topbar glass-panel">
          <div>
            <span className="badge mono">EtherWorld / Unified Hotel Screen</span>
            <h1>Loading content library...</h1>
            <p className="muted">Reading editable JSON from the data/ folder</p>
          </div>
        </section>
      </main>
    );
  }

  if (loadingState === "error") {
    return (
      <main className="ew-room-page">
        <section className="ew-shell-topbar glass-panel">
          <div>
            <span className="badge mono">EtherWorld / Unified Hotel Screen</span>
            <h1>Content load failed</h1>
            <p className="muted">Check the JSON files in data/ and app/api/game-content/route.ts</p>
          </div>
        </section>
      </main>
    );
  }

  const avatarLayers = [
    "/sprites/avatar/avatar-ether.png",
    ...(selectedAvatar.path !== "/sprites/avatar/avatar-ether.png" ? [selectedAvatar.path] : []),
    ...(selectedWardrobe.path !== selectedAvatar.path ? [selectedWardrobe.path] : [])
  ];

  return (
    <main className="ew-room-page">
      <header className="ew-shell-topbar glass-panel">
        <div>
          <span className="badge mono">EtherWorld / Unified Hotel Screen</span>
          <h1>EtherWorld Social Suite</h1>
          <p className="muted">
            Loader and entry flow preserved. This page groups room, avatars, wardrobe, furniture
            discovery and premium boutique into one large EtherWorld screen.
          </p>
        </div>
        <div className="ew-topbar-actions">
          <div className="stat-pill">Room {selectedRoom.name}</div>
          <div className="stat-pill">Avatar {selectedAvatar.name}</div>
          <button
            className={`ew-primary-btn ${showShop ? "active" : ""}`}
            type="button"
            onClick={() => setShowShop((current) => !current)}
          >
            {showShop ? "Hide Boutique" : "Open Boutique"}
          </button>
        </div>
      </header>

      <section className="ew-shell-grid">
        <aside className="ew-sidebar-column">
          <section className="glass-panel ew-panel">
            <div className="ew-panel-head">
              <span className="badge mono">Rooms</span>
              <h2>Hotel presets</h2>
            </div>
            <div className="ew-room-list">
              {content.rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className={`ew-room-card ${selectedRoom.id === room.id ? "active" : ""}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <strong>{room.name}</strong>
                  <span>{room.tagline}</span>
                  <div className="ew-room-meta">
                    <span>{room.theme}</span>
                    <span>{room.occupancy}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-panel ew-panel">
            <div className="ew-panel-head">
              <span className="badge mono">Avatar</span>
              <h2>Current look</h2>
            </div>
            <div className="ew-avatar-stage">
              <img src={selectedAvatar.path} alt={selectedAvatar.name} />
              <img src={selectedWardrobe.path} alt={selectedWardrobe.name} className="wardrobe-layer" />
            </div>
            <div className="ew-selection-copy">
              <strong>{selectedAvatar.name}</strong>
              <span>{selectedAvatar.meta ?? selectedAvatar.category}</span>
              <span>Layer selected: {selectedWardrobe.name}</span>
              <span>Tap your avatar in the room to reopen looks.</span>
            </div>
            <AssetGrid
              items={content.avatars}
              selectedId={selectedAvatar.id}
              onSelect={setSelectedAvatar}
            />
          </section>
        </aside>

        <section className="ew-main-column">
          <section className="glass-panel ew-stage-copy">
            <div>
              <span className="badge mono">{selectedRoom.theme}</span>
              <h2>{selectedRoom.name}</h2>
              <p className="muted">{selectedRoom.tagline}</p>
            </div>
            <div className="ew-highlight-strip">
              <div className="stat-pill">Click or tap floor to walk</div>
              <div className="stat-pill">Tap avatar to open looks</div>
              <div className="stat-pill">Touch controls enabled</div>
            </div>
          </section>

          <FurnitureLayer
            key={selectedRoom.id}
            roomId={selectedRoom.id}
            roomName={selectedRoom.name}
            avatarLayers={avatarLayers}
            onAvatarInteract={() => {
              setRightTab("wardrobe");
              setShowShop(false);
            }}
          />

          {showShop ? (
            <section className="glass-panel ew-shop-section">
              <div className="ew-panel-head">
                <span className="badge mono">Boutique</span>
                <h2>Premium cosmetics</h2>
              </div>
              <div className="ew-shop-layout">
                <div className="ew-shop-feature">
                  <img src={selectedShopItem.path} alt={selectedShopItem.name} />
                  <strong>{selectedShopItem.name}</strong>
                  <span>{selectedShopItem.meta}</span>
                  <button
                    className="ew-primary-btn"
                    type="button"
                    onClick={() => {
                      setSelectedWardrobe(selectedShopItem);
                      setRightTab("wardrobe");
                    }}
                  >
                    Try on
                  </button>
                </div>
                <AssetGrid
                  items={content.shopItems}
                  selectedId={selectedShopItem.id}
                  onSelect={setSelectedShopItem}
                />
              </div>
              <div className="ew-catalog-strip">
                {content.catalogItems.slice(0, 18).map((item) => (
                  <div className="ew-catalog-card" key={item.id}>
                    <img src={item.spritePath} alt={item.name} />
                    <strong>{item.name}</strong>
                    <span>
                      {item.kind} · {item.rarity} · {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="ew-sidebar-column">
          <section className="glass-panel ew-panel">
            <div className="ew-tab-row">
              <button
                className={rightTab === "wardrobe" ? "active" : ""}
                onClick={() => setRightTab("wardrobe")}
                type="button"
              >
                Wardrobe
              </button>
              <button
                className={rightTab === "shop" ? "active" : ""}
                onClick={() => setRightTab("shop")}
                type="button"
              >
                Shop
              </button>
              <button
                className={rightTab === "assets" ? "active" : ""}
                onClick={() => setRightTab("assets")}
                type="button"
              >
                Assets
              </button>
            </div>

            {rightTab === "wardrobe" ? (
              <>
                <div className="ew-panel-head">
                  <span className="badge mono">Wardrobe</span>
                  <h2>Clothes and accessories</h2>
                </div>
                <AssetGrid
                  items={content.wardrobe}
                  selectedId={selectedWardrobe.id}
                  onSelect={setSelectedWardrobe}
                />
              </>
            ) : null}

            {rightTab === "shop" ? (
              <>
                <div className="ew-panel-head">
                  <span className="badge mono">Characters</span>
                  <h2>Boutique selection</h2>
                </div>
                <AssetGrid
                  items={content.shopItems}
                  selectedId={selectedShopItem.id}
                  onSelect={setSelectedShopItem}
                />
              </>
            ) : null}

            {rightTab === "assets" ? (
              <>
                <div className="ew-panel-head">
                  <span className="badge mono">Detected</span>
                  <h2>Files found in EtherWorld</h2>
                </div>
                <div className="ew-file-list">
                  {content.discoveredFiles.map((file) => (
                    <div className="ew-file-row" key={file}>
                      <code>{file}</code>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </section>

          <section className="glass-panel ew-panel">
            <div className="ew-panel-head">
              <span className="badge mono">Furniture</span>
              <h2>Local sprite library</h2>
            </div>
            <div className="ew-furni-feature">
              <img src={selectedFurniture.path} alt={selectedFurniture.name} />
              <div>
                <strong>{selectedFurniture.name}</strong>
                <span>{selectedFurniture.category}</span>
                <span>
                  {content.furnitureData.find((item) => item.id === selectedFurniture.id)?.states.join(" / ") ?? "idle"}
                </span>
              </div>
            </div>
            <AssetGrid
              items={content.furnitures}
              selectedId={selectedFurniture.id}
              onSelect={setSelectedFurniture}
            />
          </section>
        </aside>
      </section>
    </main>
  );
}
