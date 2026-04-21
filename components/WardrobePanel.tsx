'use client';

import { useState } from 'react';
import { CLOTHING_ITEMS } from '@/data/clothing';

export interface AvatarOutfit {
  hair: string;
  shirt: string;
  jacket: string;
  pants: string;
  shoes: string;
}

interface WardrobePanelProps {
  outfit: AvatarOutfit;
  onOutfitChange: (part: keyof AvatarOutfit, value: string) => void;
}

const WARDROBE_SECTIONS: { key: keyof AvatarOutfit; label: string; emoji: string }[] = [
  { key: 'hair', label: 'Hair', emoji: '💇' },
  { key: 'shirt', label: 'Tops', emoji: '👕' },
  { key: 'jacket', label: 'Jackets', emoji: '🧥' },
  { key: 'pants', label: 'Bottoms', emoji: '👖' },
  { key: 'shoes', label: 'Shoes', emoji: '👟' },
];

export function WardrobePanel({ outfit, onOutfitChange }: WardrobePanelProps) {
  const [activeSection, setActiveSection] = useState<keyof AvatarOutfit>('shirt');

  // Map sections to clothing categories
  const getCategoryItems = (section: keyof AvatarOutfit) => {
    switch (section) {
      case 'hair':
        return Object.entries(CLOTHING_ITEMS.hair).map(([id, item]) => ({
          id,
          label: item.label,
        }));
      case 'shirt':
        return Object.entries(CLOTHING_ITEMS.shirts).map(([id, item]) => ({
          id,
          label: item.label,
        }));
      case 'jacket':
        return Object.entries(CLOTHING_ITEMS.jackets).map(([id, item]) => ({
          id,
          label: item.label,
        }));
      case 'pants':
        return Object.entries(CLOTHING_ITEMS.pants).map(([id, item]) => ({
          id,
          label: item.label,
        }));
      case 'shoes':
        return Object.entries(CLOTHING_ITEMS.shoes).map(([id, item]) => ({
          id,
          label: item.label,
        }));
      default:
        return [];
    }
  };

  const items = getCategoryItems(activeSection);
  const currentValue = outfit[activeSection];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        height: '100%',
        gap: 12,
      }}
    >
      {/* Section Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 6,
        }}
      >
        {WARDROBE_SECTIONS.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            title={section.label}
            style={{
              padding: '8px',
              borderRadius: 8,
              border:
                activeSection === section.key
                  ? '2px solid #f59e0b'
                  : '1px solid rgba(255,255,255,0.1)',
              background:
                activeSection === section.key
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(0,0,0,0.2)',
              color: activeSection === section.key ? '#f59e0b' : '#fff',
              cursor: 'pointer',
              fontSize: 18,
              transition: 'all 0.2s',
            }}
          >
            {section.emoji}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 6,
          overflowY: 'auto',
          paddingRight: 6,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onOutfitChange(activeSection, item.id)}
            style={{
              padding: '8px',
              borderRadius: 6,
              border:
                currentValue === item.id
                  ? '2px solid #10b981'
                  : '1px solid rgba(255,255,255,0.1)',
              background:
                currentValue === item.id
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(0,0,0,0.2)',
              color: currentValue === item.id ? '#10b981' : '#e5e7eb',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (currentValue !== item.id) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(100,100,100,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentValue !== item.id) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.2)';
              }
            }}
          >
            {item.label?.split(' ').slice(0, 2).join('\n')}
          </button>
        ))}
      </div>
    </div>
  );
}
