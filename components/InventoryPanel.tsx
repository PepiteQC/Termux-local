'use client';

import { useMemo } from 'react';
import { FURNITURE_REGISTRY } from '@/lib/furniture/FurnitureRegistry';

export interface InventoryItem {
  id: string;
  type: 'furniture' | 'clothing';
  itemId: string;
  quantity: number;
}

interface InventoryPanelProps {
  items: InventoryItem[];
  onPlaceFurniture?: (itemId: string) => void;
  onUseClothing?: (itemId: string) => void;
}

export function InventoryPanel({
  items,
  onPlaceFurniture,
  onUseClothing,
}: InventoryPanelProps) {
  const furnitureItems = useMemo(
    () => items.filter((item) => item.type === 'furniture'),
    [items]
  );

  const clothingItems = useMemo(
    () => items.filter((item) => item.type === 'clothing'),
    [items]
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        height: '100%',
        gap: 12,
      }}
    >
      {/* Header Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          🎁 Furniture ({furnitureItems.length})
        </button>
        <button
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#a78bfa',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          👗 Clothing ({clothingItems.length})
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
          gap: 8,
          overflowY: 'auto',
          paddingRight: 6,
        }}
      >
        {/* Furniture Section */}
        {furnitureItems.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#60a5fa',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Furniture
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {furnitureItems.map((item) => {
                const def = FURNITURE_REGISTRY[item.itemId];
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px',
                      borderRadius: 6,
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#fff' }}>
                        {def?.label || item.itemId}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <button
                      onClick={() => onPlaceFurniture?.(item.itemId)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: '#3b82f6',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: 600,
                        transition: 'background 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#3b82f6';
                      }}
                    >
                      Place
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clothing Section */}
        {clothingItems.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#a78bfa',
                textTransform: 'uppercase',
                marginBottom: 6,
                marginTop: furnitureItems.length > 0 ? 4 : 0,
              }}
            >
              Clothing
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {clothingItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px',
                    borderRadius: 6,
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#fff' }}>
                      {item.itemId.replace(/-/g, ' ')}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <button
                    onClick={() => onUseClothing?.(item.itemId)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      background: '#8b5cf6',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 600,
                      transition: 'background 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#7c3aed';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#8b5cf6';
                    }}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              color: '#64748b',
              textAlign: 'center',
              fontSize: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📦</div>
              Your inventory is empty
              <br />
              Buy items from the shop!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
