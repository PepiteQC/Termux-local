'use client';

import { useState } from 'react';
import { ShopPanel } from './ShopPanel';
import { WardrobePanel, type AvatarOutfit } from './WardrobePanel';
import { InventoryPanel, type InventoryItem } from './InventoryPanel';

type PanelType = 'wardrobe' | 'shop' | 'inventory' | null;

interface RoomUIPanelProps {
  outfit: AvatarOutfit;
  onOutfitChange: (part: keyof AvatarOutfit, value: string) => void;
  inventory: InventoryItem[];
  onBuyItem?: (itemId: string, price: number) => void;
  onPlaceFurniture?: (itemId: string) => void;
  status: string;
}

export function RoomUIPanel({
  outfit,
  onOutfitChange,
  inventory,
  onBuyItem,
  onPlaceFurniture,
  status,
}: RoomUIPanelProps) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const panels: Array<{ key: PanelType; label: string; icon: string }> = [
    { key: 'wardrobe', label: 'Wardrobe', icon: '👗' },
    { key: 'shop', label: 'Shop', icon: '🛍️' },
    { key: 'inventory', label: 'Inventory', icon: '🎒' },
  ];

  return (
    <div
      style={{
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 18px 48px rgba(0,0,0,0.22)',
        padding: 16,
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: 12,
        minWidth: 320,
        height: 'fit-content',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* Panel Toggle Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {panels.map((panel) => (
          <button
            key={panel.key}
            onClick={() => setActivePanel(activePanel === panel.key ? null : panel.key)}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border:
                activePanel === panel.key
                  ? '2px solid #fbbf24'
                  : '1px solid rgba(255,255,255,0.1)',
              background:
                activePanel === panel.key
                  ? 'rgba(251, 191, 36, 0.2)'
                  : 'rgba(255,255,255,0.08)',
              color: activePanel === panel.key ? '#fbbf24' : '#e5e7eb',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
            onMouseEnter={(e) => {
              if (activePanel !== panel.key) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              if (activePanel !== panel.key) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              }
            }}
          >
            <span style={{ fontSize: 18 }}>{panel.icon}</span>
            <span>{panel.label}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      {activePanel && (
        <div
          style={{
            display: 'grid',
            gridTemplateRows: '1fr',
            minHeight: 300,
            overflow: 'hidden',
          }}
        >
          {activePanel === 'wardrobe' && (
            <WardrobePanel outfit={outfit} onOutfitChange={onOutfitChange} />
          )}

          {activePanel === 'shop' && (
            <ShopPanel onPurchase={onBuyItem} />
          )}

          {activePanel === 'inventory' && (
            <InventoryPanel
              items={inventory}
              onPlaceFurniture={onPlaceFurniture}
              onUseClothing={(id) => console.log('Use clothing:', id)}
            />
          )}
        </div>
      )}

      {/* Status Bar */}
      {!activePanel && (
        <div
          style={{
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: 12,
            fontSize: 12,
            lineHeight: 1.5,
            color: '#cbd5e1',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6, color: '#f1f5f9' }}>
            Status
          </div>
          {status}
        </div>
      )}
    </div>
  );
}
