'use client';

import { useState } from 'react';
import { MARKETPLACE_ITEMS, SHOP_CATEGORIES, getItemsByCategory } from '@/data/marketplace';

interface ShopPanelProps {
  onPurchase?: (itemId: string, price: number) => void;
  onBudget?: (amount: number) => void;
}

export function ShopPanel({ onPurchase, onBudget }: ShopPanelProps) {
  const [activeCategory, setActiveCategory] = useState(SHOP_CATEGORIES[0].key);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const items = getItemsByCategory(activeCategory);
  const selected = selectedItem
    ? MARKETPLACE_ITEMS.find((item) => item.id === selectedItem)
    : null;

  const handlePurchase = () => {
    if (selected && onPurchase) {
      onPurchase(selected.itemId, selected.price);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100%',
        gap: 12,
      }}
    >
      {/* Categories */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: 6,
        }}
      >
        {SHOP_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              setSelectedItem(null);
            }}
            title={cat.label}
            style={{
              padding: '8px',
              borderRadius: 8,
              border:
                activeCategory === cat.key
                  ? '2px solid #fbbf24'
                  : '1px solid rgba(255,255,255,0.1)',
              background:
                activeCategory === cat.key
                  ? 'rgba(251, 191, 36, 0.15)'
                  : 'rgba(0,0,0,0.2)',
              color: activeCategory === cat.key ? '#fbbf24' : '#fff',
              cursor: 'pointer',
              fontSize: 20,
              transition: 'all 0.2s',
            }}
          >
            {cat.emoji}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          overflowY: 'auto',
          paddingRight: 8,
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: '#999',
              padding: '20px 10px',
              fontSize: '12px',
            }}
          >
            No items in this category
          </div>
        ) : (
          items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item.id)}
            style={{
              padding: '10px',
              borderRadius: 8,
              border:
                selectedItem === item.id
                  ? '2px solid #60a5fa'
                  : '1px solid rgba(255,255,255,0.1)',
              background:
                selectedItem === item.id
                  ? 'rgba(96, 165, 250, 0.2)'
                  : 'rgba(0,0,0,0.2)',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (selectedItem !== item.id) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(100,100,100,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedItem !== item.id) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.2)';
              }
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
            <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>
              {item.price}$
            </div>
          </button>
          ))
        )}
      </div>

      {/* Selected Item Details */}
      {selected && (
        <div
          style={{
            borderRadius: 8,
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            padding: 10,
            display: 'grid',
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>
              {selected.name}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
              {selected.description}
            </div>
          </div>
          <button
            onClick={handlePurchase}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: '#10b981',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#10b981';
            }}
          >
            Buy for {selected.price}$
          </button>
        </div>
      )}
    </div>
  );
}
