export interface MarketplaceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  type: 'furniture' | 'clothing';
  itemId: string;
  description: string;
}

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  // Furniture - Seating
  { id: 'mp-chair-nebula', name: 'Nebula Chair', category: 'seating', price: 50, type: 'furniture', itemId: 'chair-nebula', description: 'Modern nebula-inspired chair with glow effect' },
  { id: 'mp-sofa-ivory', name: 'Ivory Sofa', category: 'seating', price: 120, type: 'furniture', itemId: 'sofa-ivory', description: 'Classic ivory-colored sofa' },
  { id: 'mp-lounge-chair', name: 'Lounge Chair', category: 'seating', price: 85, type: 'furniture', itemId: 'lounge-chair-ivory', description: 'Comfortable lounge chair' },
  { id: 'mp-office-chair', name: 'Office Chair', category: 'seating', price: 60, type: 'furniture', itemId: 'office-chair-black', description: 'Professional office chair' },

  // Furniture - Tables & Desks
  { id: 'mp-coffee-table-gold', name: 'Gold Coffee Table', category: 'tables', price: 75, type: 'furniture', itemId: 'coffee-table-gold', description: 'Elegant gold coffee table' },
  { id: 'mp-coffee-table-glass', name: 'Glass Coffee Table', category: 'tables', price: 70, type: 'furniture', itemId: 'coffee-table-glass', description: 'Modern glass table' },
  { id: 'mp-table-prism', name: 'Prism Table', category: 'tables', price: 100, type: 'furniture', itemId: 'table-prism', description: 'Geometric prism table' },
  { id: 'mp-desk-modern', name: 'Modern L-Desk', category: 'tables', price: 200, type: 'furniture', itemId: 'desk-l-modern', description: 'Spacious L-shaped work desk' },

  // Furniture - Beds
  { id: 'mp-bed-obsidian', name: 'Obsidian Bed', category: 'beds', price: 250, type: 'furniture', itemId: 'bed-obsidian', description: 'Dark obsidian platform bed' },
  { id: 'mp-bed-royal', name: 'Royal Red Bed', category: 'beds', price: 300, type: 'furniture', itemId: 'bed-royal-red', description: 'Luxurious royal red bed' },
  { id: 'mp-bed-tiki', name: 'Tiki Canopy Bed', category: 'beds', price: 350, type: 'furniture', itemId: 'bed-tiki-canopy', description: 'Tropical tiki canopy bed' },
  { id: 'mp-hammock', name: 'Cream Hammock', category: 'beds', price: 180, type: 'furniture', itemId: 'hammock-cream', description: 'Relaxing cream hammock' },

  // Furniture - Decor
  { id: 'mp-plant', name: 'Modern Plant', category: 'decor', price: 40, type: 'furniture', itemId: 'plant-tall-modern', description: 'Tall modern plant' },
  { id: 'mp-lamp-halo', name: 'Halo Lamp', category: 'decor', price: 90, type: 'furniture', itemId: 'lamp-halo', description: 'Glowing halo lamp' },
  { id: 'mp-statue', name: 'Gold Statue', category: 'decor', price: 150, type: 'furniture', itemId: 'statue-gold', description: 'Decorative gold statue' },
  { id: 'mp-crystal', name: 'Ether Crystal', category: 'decor', price: 110, type: 'furniture', itemId: 'crystal-ether', description: 'Glowing crystal decoration' },
  { id: 'mp-floor-lamp', name: 'White Floor Lamp', category: 'decor', price: 80, type: 'furniture', itemId: 'floor-lamp-white', description: 'Elegant floor lamp' },
  { id: 'mp-fireplace', name: 'Classic Fireplace', category: 'decor', price: 220, type: 'furniture', itemId: 'fireplace-classic', description: 'Cozy fireplace' },

  // Furniture - Wall Items
  { id: 'mp-window-city', name: 'City Window', category: 'walls', price: 200, type: 'furniture', itemId: 'window-city-wide', description: 'Large city view window' },
  { id: 'mp-tv-wall', name: 'Wall TV', category: 'walls', price: 180, type: 'furniture', itemId: 'tv-wall-black', description: 'Sleek wall-mounted TV' },
  { id: 'mp-shelf-wall', name: 'Wall Shelf', category: 'walls', price: 85, type: 'furniture', itemId: 'wall-shelf-minimal', description: 'Minimal wall shelf' },
  { id: 'mp-waterfall', name: 'Wall Waterfall', category: 'walls', price: 250, type: 'furniture', itemId: 'waterfall-wall', description: 'Decorative wall waterfall' },

  // Furniture - Rugs
  { id: 'mp-rug-gray', name: 'Gray Rug', category: 'rugs', price: 85, type: 'furniture', itemId: 'rug-gray-large', description: 'Large gray area rug' },
  { id: 'mp-rug-royal', name: 'Royal Red Rug', category: 'rugs', price: 95, type: 'furniture', itemId: 'rug-royal-red', description: 'Luxurious red rug' },
  { id: 'mp-rug-sand', name: 'Sand Rug', category: 'rugs', price: 80, type: 'furniture', itemId: 'rug-sand-warm', description: 'Warm sand-colored rug' },

  // Clothing - Tops
  { id: 'mp-shirt-polo-blue', name: 'Blue Polo Shirt', category: 'tops', price: 20, type: 'clothing', itemId: 'shirt-polo-blue', description: 'Classic blue polo shirt' },
  { id: 'mp-shirt-cropped', name: 'Cropped Pink Top', category: 'tops', price: 25, type: 'clothing', itemId: 'shirt-cropped-pink', description: 'Trendy cropped pink top' },
  { id: 'mp-shirt-tshirt-black', name: 'Black T-Shirt', category: 'tops', price: 15, type: 'clothing', itemId: 'shirt-tshirt-black', description: 'Classic black tee' },
  { id: 'mp-tank-yellow', name: 'Yellow Tank', category: 'tops', price: 12, type: 'clothing', itemId: 'shirt-tank-yellow', description: 'Bright yellow tank top' },

  // Clothing - Jackets
  { id: 'mp-jacket-bomber-blue', name: 'Blue Bomber', category: 'jackets', price: 45, type: 'clothing', itemId: 'jacket-bomber-blue', description: 'Cool blue bomber jacket' },
  { id: 'mp-jacket-bomber-black', name: 'Black Bomber', category: 'jackets', price: 45, type: 'clothing', itemId: 'jacket-bomber-black', description: 'Classic black bomber' },
  { id: 'mp-jacket-denim', name: 'Denim Jacket', category: 'jackets', price: 55, type: 'clothing', itemId: 'jacket-cropped-denim', description: 'Trendy denim jacket' },
  { id: 'mp-jacket-leather', name: 'Brown Leather', category: 'jackets', price: 75, type: 'clothing', itemId: 'jacket-leather-brown', description: 'Stylish leather jacket' },

  // Clothing - Pants
  { id: 'mp-pants-jeans-blue', name: 'Blue Jeans', category: 'pants', price: 30, type: 'clothing', itemId: 'pants-jeans-blue', description: 'Classic blue jeans' },
  { id: 'mp-pants-shorts-black', name: 'Black Shorts', category: 'pants', price: 18, type: 'clothing', itemId: 'pants-shorts-black', description: 'Comfortable shorts' },
  { id: 'mp-pants-sweatpants', name: 'Gray Sweatpants', category: 'pants', price: 28, type: 'clothing', itemId: 'pants-sweatpants-gray', description: 'Cozy sweatpants' },
  { id: 'mp-skirt-red', name: 'Red Skirt', category: 'pants', price: 32, type: 'clothing', itemId: 'pants-skirt-red', description: 'Stylish red skirt' },

  // Clothing - Footwear
  { id: 'mp-shoes-sneakers-white', name: 'White Sneakers', category: 'shoes', price: 25, type: 'clothing', itemId: 'shoes-sneakers-white', description: 'Clean white sneakers' },
  { id: 'mp-shoes-heels-red', name: 'Red Heels', category: 'shoes', price: 35, type: 'clothing', itemId: 'shoes-heels-red', description: 'Elegant red heels' },
  { id: 'mp-shoes-heels-black', name: 'Black Heels', category: 'shoes', price: 35, type: 'clothing', itemId: 'shoes-heels-black', description: 'Classic black heels' },
  { id: 'mp-shoes-hi-tops', name: 'White Hi-Tops', category: 'shoes', price: 40, type: 'clothing', itemId: 'shoes-hi-tops-white', description: 'Trendy hi-top sneakers' },
  { id: 'mp-shoes-boots', name: 'Brown Boots', category: 'shoes', price: 50, type: 'clothing', itemId: 'shoes-boots-brown', description: 'Sturdy brown boots' },

  // Clothing - Accessories
  { id: 'mp-glasses-aviator', name: 'Aviator Glasses', category: 'accessories', price: 30, type: 'clothing', itemId: 'glasses-aviator', description: 'Cool aviator sunglasses' },
  { id: 'mp-glasses-round', name: 'Round Glasses', category: 'accessories', price: 25, type: 'clothing', itemId: 'glasses-round', description: 'Vintage round glasses' },
  { id: 'mp-beanie', name: 'Black Beanie', category: 'accessories', price: 20, type: 'clothing', itemId: 'hat-beanie', description: 'Cozy black beanie' },
  { id: 'mp-cap-blue', name: 'Blue Cap', category: 'accessories', price: 22, type: 'clothing', itemId: 'hat-cap', description: 'Classic baseball cap' },
];

export const SHOP_CATEGORIES = [
  { key: 'seating', label: 'Seating', emoji: '🪑' },
  { key: 'tables', label: 'Tables & Desks', emoji: '🛏️' },
  { key: 'beds', label: 'Beds', emoji: '🛏️' },
  { key: 'decor', label: 'Decor', emoji: '✨' },
  { key: 'walls', label: 'Wall Items', emoji: '🪟' },
  { key: 'rugs', label: 'Rugs', emoji: '🎫' },
  { key: 'tops', label: 'Tops', emoji: '👕' },
  { key: 'jackets', label: 'Jackets', emoji: '🧥' },
  { key: 'pants', label: 'Pants', emoji: '👖' },
  { key: 'shoes', label: 'Shoes', emoji: '👟' },
  { key: 'accessories', label: 'Accessories', emoji: '🕶️' },
];

export function getItemsByCategory(category: string): MarketplaceItem[] {
  return MARKETPLACE_ITEMS.filter((item) => item.category === category);
}

export function getMarketplaceItem(id: string): MarketplaceItem | undefined {
  return MARKETPLACE_ITEMS.find((item) => item.id === id);
}
