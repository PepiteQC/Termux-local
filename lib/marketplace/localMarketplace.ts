import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

import { FURNITURE_REGISTRY } from "../furniture/FurnitureRegistry";

export const DEFAULT_MARKETPLACE_PLAYER_ID = "local-player";

const DATA_FILE = path.join(process.cwd(), "data", "etherworld-marketplace.json");

const InventoryItemSchema = z.object({
  instanceId: z.string(),
  itemType: z.string(),
  label: z.string(),
  sprite: z.string(),
  category: z.string(),
  limitedStack: z.number().int().nonnegative(),
  limitedNumber: z.number().int().nonnegative(),
});

const OfferSchema = z.object({
  offerId: z.number().int().positive(),
  itemId: z.string(),
  itemType: z.string(),
  label: z.string(),
  sprite: z.string(),
  category: z.string(),
  sellerId: z.string(),
  sellerName: z.string(),
  buyerId: z.string().nullable(),
  price: z.number().int().nonnegative(),
  timestamp: z.number().int().nonnegative(),
  soldTimestamp: z.number().int().nonnegative(),
  state: z.enum(["OPEN", "SOLD", "CLOSED"]),
  limitedStack: z.number().int().nonnegative(),
  limitedNumber: z.number().int().nonnegative(),
});

const SaleSchema = z.object({
  saleId: z.number().int().positive(),
  offerId: z.number().int().positive(),
  itemType: z.string(),
  label: z.string(),
  sprite: z.string(),
  category: z.string(),
  sellerId: z.string(),
  sellerName: z.string(),
  buyerId: z.string(),
  buyerName: z.string(),
  price: z.number().int().nonnegative(),
  buyerPrice: z.number().int().nonnegative(),
  timestamp: z.number().int().nonnegative(),
});

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  ether: z.number().int().nonnegative(),
  pendingEther: z.number().int().nonnegative(),
  inventory: z.array(InventoryItemSchema),
});

const MarketplaceStateSchema = z.object({
  nextInventoryId: z.number().int().positive(),
  nextOfferId: z.number().int().positive(),
  nextSaleId: z.number().int().positive(),
  players: z.record(z.string(), PlayerSchema),
  offers: z.array(OfferSchema),
  sales: z.array(SaleSchema),
});

type InventoryItem = z.infer<typeof InventoryItemSchema>;
type MarketOffer = z.infer<typeof OfferSchema>;
type MarketSale = z.infer<typeof SaleSchema>;
type MarketPlayer = z.infer<typeof PlayerSchema>;
type MarketplaceState = z.infer<typeof MarketplaceStateSchema>;

type SortMode =
  | "price_asc"
  | "price_desc"
  | "sold_desc"
  | "sold_asc"
  | "count_desc"
  | "count_asc"
  | "newest";

type SnapshotFilters = {
  playerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortMode;
};

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

function registryEntry(itemType: string) {
  const item = FURNITURE_REGISTRY[itemType as keyof typeof FURNITURE_REGISTRY];
  if (!item) {
    throw new Error(`Unknown furniture type: ${itemType}`);
  }
  return item;
}

function resolveCategory(itemType: string) {
  if (
    [
      "sectional-sofa-dark",
      "sectional-sofa-dark-corner",
      "office-chair-black",
      "sofa-ivory",
      "lounge-chair-ivory",
      "bar-stool-gold",
      "stool-tiki",
      "chair-wicker",
      "sofa-tiki-lounge",
    ].includes(itemType)
  ) {
    return "seating";
  }

  if (
    [
      "coffee-table-glass",
      "coffee-table-gold",
      "table-tiki-low",
    ].includes(itemType)
  ) {
    return "table";
  }

  if (
    [
      "desk-l-modern",
      "monitor-flat-27",
      "tv-wall-black",
      "media-console-black",
    ].includes(itemType)
  ) {
    return "office";
  }

  if (
    [
      "fridge-steel",
      "kitchen-line-dark",
      "cabinet-dark-low",
      "nightstand-gold",
      "shelf-luxury-backbar",
      "shelf-tiki-drinks",
      "wall-shelf-minimal",
    ].includes(itemType)
  ) {
    return "storage";
  }

  if (
    [
      "bed-royal-red",
      "bed-tiki-canopy",
    ].includes(itemType)
  ) {
    return "bed";
  }

  if (
    [
      "chandelier-grand-gold",
      "fireplace-classic",
      "grand-piano-black",
      "jacuzzi-round-gold",
      "statue-gold",
      "bar-marble-black",
      "window-city-wide-gold",
      "rug-royal-red",
    ].includes(itemType)
  ) {
    return "luxury";
  }

  if (
    [
      "waterfall-wall",
      "bar-tiki-bamboo",
      "pool-plunge-stone",
      "firepit-stone",
      "hammock-cream",
      "surfboard-yellow",
      "palm-tree-tall",
      "torch-tiki",
      "rug-sand-warm",
    ].includes(itemType)
  ) {
    return "tiki";
  }

  if (
    [
      "floor-lamp-white",
      "lamp-halo",
    ].includes(itemType)
  ) {
    return "lighting";
  }

  if (
    [
      "window-city-wide",
    ].includes(itemType)
  ) {
    return "structure";
  }

  return "decor";
}

function createInventoryItem(state: MarketplaceState, itemType: string): InventoryItem {
  const def = registryEntry(itemType);
  const instanceId = `inv-${state.nextInventoryId++}`;

  return {
    instanceId,
    itemType,
    label: def.label,
    sprite: def.sprite,
    category: resolveCategory(itemType),
    limitedStack: 0,
    limitedNumber: 0,
  };
}

function createOfferRecord(
  state: MarketplaceState,
  item: InventoryItem,
  sellerId: string,
  sellerName: string,
  price: number,
): MarketOffer {
  return {
    offerId: state.nextOfferId++,
    itemId: item.instanceId,
    itemType: item.itemType,
    label: item.label,
    sprite: item.sprite,
    category: item.category,
    sellerId,
    sellerName,
    buyerId: null,
    price,
    timestamp: nowUnix(),
    soldTimestamp: 0,
    state: "OPEN",
    limitedStack: item.limitedStack,
    limitedNumber: item.limitedNumber,
  };
}

function createSaleRecord(
  state: MarketplaceState,
  offer: MarketOffer,
  buyer: MarketPlayer,
  buyerPrice: number,
): MarketSale {
  return {
    saleId: state.nextSaleId++,
    offerId: offer.offerId,
    itemType: offer.itemType,
    label: offer.label,
    sprite: offer.sprite,
    category: offer.category,
    sellerId: offer.sellerId,
    sellerName: offer.sellerName,
    buyerId: buyer.id,
    buyerName: buyer.name,
    price: offer.price,
    buyerPrice,
    timestamp: nowUnix(),
  };
}

export function calculateCommission(price: number) {
  return price + Math.ceil(price / 100);
}

function buildPlayer(
  state: MarketplaceState,
  id: string,
  name: string,
  ether: number,
  inventoryTypes: string[],
): MarketPlayer {
  return {
    id,
    name,
    ether,
    pendingEther: 0,
    inventory: inventoryTypes.map((type) => createInventoryItem(state, type)),
  };
}

function createInitialState(): MarketplaceState {
  const state: MarketplaceState = {
    nextInventoryId: 1,
    nextOfferId: 1,
    nextSaleId: 1,
    players: {},
    offers: [],
    sales: [],
  };

  state.players[DEFAULT_MARKETPLACE_PLAYER_ID] = buildPlayer(
    state,
    DEFAULT_MARKETPLACE_PLAYER_ID,
    "EtherPlayer",
    25000,
    [
      "sectional-sofa-dark",
      "office-chair-black",
      "desk-l-modern",
      "floor-lamp-white",
      "plant-tall-modern",
      "sofa-ivory",
      "bar-tiki-bamboo",
      "torch-tiki",
      "rug-gray-large",
      "monitor-flat-27",
    ],
  );

  state.players["market-bot-modern"] = buildPlayer(
    state,
    "market-bot-modern",
    "Modern Broker",
    0,
    [],
  );

  state.players["market-bot-luxury"] = buildPlayer(
    state,
    "market-bot-luxury",
    "Luxury Broker",
    0,
    [],
  );

  state.players["market-bot-tiki"] = buildPlayer(
    state,
    "market-bot-tiki",
    "Tiki Merchant",
    0,
    [],
  );

  const seedOffers = [
    { sellerId: "market-bot-modern", sellerName: "Modern Broker", itemType: "window-city-wide", price: 420 },
    { sellerId: "market-bot-modern", sellerName: "Modern Broker", itemType: "tv-wall-black", price: 180 },
    { sellerId: "market-bot-modern", sellerName: "Modern Broker", itemType: "media-console-black", price: 120 },
    { sellerId: "market-bot-modern", sellerName: "Modern Broker", itemType: "sectional-sofa-dark", price: 260 },
    { sellerId: "market-bot-modern", sellerName: "Modern Broker", itemType: "coffee-table-glass", price: 95 },
    { sellerId: "market-bot-modern", sellerName: "Modern Broker", itemType: "fridge-steel", price: 210 },

    { sellerId: "market-bot-luxury", sellerName: "Luxury Broker", itemType: "chandelier-grand-gold", price: 980 },
    { sellerId: "market-bot-luxury", sellerName: "Luxury Broker", itemType: "bed-royal-red", price: 740 },
    { sellerId: "market-bot-luxury", sellerName: "Luxury Broker", itemType: "grand-piano-black", price: 620 },
    { sellerId: "market-bot-luxury", sellerName: "Luxury Broker", itemType: "jacuzzi-round-gold", price: 890 },
    { sellerId: "market-bot-luxury", sellerName: "Luxury Broker", itemType: "statue-gold", price: 370 },

    { sellerId: "market-bot-tiki", sellerName: "Tiki Merchant", itemType: "waterfall-wall", price: 520 },
    { sellerId: "market-bot-tiki", sellerName: "Tiki Merchant", itemType: "bed-tiki-canopy", price: 680 },
    { sellerId: "market-bot-tiki", sellerName: "Tiki Merchant", itemType: "pool-plunge-stone", price: 530 },
    { sellerId: "market-bot-tiki", sellerName: "Tiki Merchant", itemType: "palm-tree-tall", price: 290 },
    { sellerId: "market-bot-tiki", sellerName: "Tiki Merchant", itemType: "torch-tiki", price: 110 },
  ];

  for (const seed of seedOffers) {
    const item = createInventoryItem(state, seed.itemType);
    state.offers.push(
      createOfferRecord(state, item, seed.sellerId, seed.sellerName, seed.price),
    );
  }

  return state;
}

async function ensureStateFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    const initial = createInitialState();
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readState() {
  await ensureStateFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return MarketplaceStateSchema.parse(JSON.parse(raw));
}

async function writeState(state: MarketplaceState) {
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
}

function getPlayer(state: MarketplaceState, playerId: string) {
  const player = state.players[playerId];
  if (!player) {
    throw new Error(`Unknown player: ${playerId}`);
  }
  return player;
}

function buildMarketRows(
  state: MarketplaceState,
  search: string,
  minPrice: number,
  maxPrice: number,
  sort: SortMode,
) {
  const searchText = search.trim().toLowerCase();
  const openOffers = state.offers.filter((offer) => offer.state === "OPEN");

  const groups = new Map<
    string,
    {
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
    }
  >();

  for (const offer of openOffers) {
    const buyerPrice = calculateCommission(offer.price);

    if (minPrice > 0 && buyerPrice < minPrice) continue;
    if (maxPrice > 0 && buyerPrice > maxPrice) continue;

    if (
      searchText &&
      !`${offer.label} ${offer.itemType} ${offer.category}`.toLowerCase().includes(searchText)
    ) {
      continue;
    }

    const key = `${offer.itemType}:${offer.limitedStack}:${offer.limitedNumber}`;
    const existing = groups.get(key);

    const soldToday = state.sales.filter(
      (sale) =>
        sale.itemType === offer.itemType &&
        sale.timestamp >= nowUnix() - 86400,
    ).length;

    const recentSales = state.sales.filter(
      (sale) =>
        sale.itemType === offer.itemType &&
        sale.timestamp >= nowUnix() - 86400 * 7,
    );

    const avgPrice7 =
      recentSales.length > 0
        ? Math.round(
            recentSales.reduce((sum, sale) => sum + sale.price, 0) /
              recentSales.length,
          )
        : offer.price;

    if (!existing) {
      groups.set(key, {
        itemType: offer.itemType,
        label: offer.label,
        sprite: offer.sprite,
        category: offer.category,
        cheapestOfferId: offer.offerId,
        cheapestPrice: offer.price,
        buyerPrice,
        count: 1,
        soldToday,
        avgPrice7,
        latestTimestamp: offer.timestamp,
      });
      continue;
    }

    existing.count += 1;
    existing.latestTimestamp = Math.max(existing.latestTimestamp, offer.timestamp);

    if (offer.price < existing.cheapestPrice) {
      existing.cheapestPrice = offer.price;
      existing.buyerPrice = buyerPrice;
      existing.cheapestOfferId = offer.offerId;
    }
  }

  const rows = Array.from(groups.values());

  rows.sort((a, b) => {
    switch (sort) {
      case "price_desc":
        return b.buyerPrice - a.buyerPrice;
      case "sold_desc":
        return b.soldToday - a.soldToday;
      case "sold_asc":
        return a.soldToday - b.soldToday;
      case "count_desc":
        return b.count - a.count;
      case "count_asc":
        return a.count - b.count;
      case "newest":
        return b.latestTimestamp - a.latestTimestamp;
      case "price_asc":
      default:
        return a.buyerPrice - b.buyerPrice;
    }
  });

  return rows.slice(0, 250);
}

export async function getMarketplaceSnapshot(filters: SnapshotFilters = {}) {
  const playerId = filters.playerId ?? DEFAULT_MARKETPLACE_PLAYER_ID;
  const search = filters.search ?? "";
  const minPrice = Math.max(0, Math.floor(filters.minPrice ?? 0));
  const maxPrice = Math.max(0, Math.floor(filters.maxPrice ?? 0));
  const sort = filters.sort ?? "price_asc";

  const state = await readState();
  const player = getPlayer(state, playerId);

  const ownOffers = state.offers
    .filter((offer) => offer.sellerId === playerId && offer.state === "OPEN")
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((offer) => ({
      ...offer,
      buyerPrice: calculateCommission(offer.price),
    }));

  const recentSales = [...state.sales]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 12);

  return {
    player: {
      id: player.id,
      name: player.name,
      ether: player.ether,
      pendingEther: player.pendingEther,
      inventory: player.inventory,
      activeOffers: ownOffers.length,
    },
    offers: buildMarketRows(state, search, minPrice, maxPrice, sort),
    ownOffers,
    recentSales,
  };
}

export async function sellMarketplaceItem(playerId: string, inventoryId: string, price: number) {
  const state = await readState();
  const player = getPlayer(state, playerId);
  const normalizedPrice = Math.max(1, Math.floor(price));

  const index = player.inventory.findIndex((item) => item.instanceId === inventoryId);
  if (index === -1) {
    throw new Error("Objet introuvable dans l’inventaire.");
  }

  const [item] = player.inventory.splice(index, 1);
  const offer = createOfferRecord(state, item, player.id, player.name, normalizedPrice);
  state.offers.push(offer);

  await writeState(state);

  return {
    notice: `${item.label} mis en vente pour ${normalizedPrice} Ether.`,
  };
}

export async function buyMarketplaceOffer(playerId: string, offerId: number) {
  const state = await readState();
  const buyer = getPlayer(state, playerId);

  const offer = state.offers.find((entry) => entry.offerId === offerId);
  if (!offer || offer.state !== "OPEN") {
    throw new Error("Cette offre n’est plus disponible.");
  }

  if (offer.sellerId === playerId) {
    throw new Error("Tu ne peux pas acheter ta propre offre.");
  }

  const buyerPrice = calculateCommission(offer.price);
  if (buyer.ether < buyerPrice) {
    throw new Error("Pas assez de points Ether.");
  }

  buyer.ether -= buyerPrice;
  buyer.inventory.unshift({
    instanceId: `inv-${state.nextInventoryId++}`,
    itemType: offer.itemType,
    label: offer.label,
    sprite: offer.sprite,
    category: offer.category,
    limitedStack: offer.limitedStack,
    limitedNumber: offer.limitedNumber,
  });

  offer.state = "SOLD";
  offer.soldTimestamp = nowUnix();
  offer.buyerId = buyer.id;

  const seller = state.players[offer.sellerId];
  if (seller) {
    seller.pendingEther += offer.price;
  }

  state.sales.push(createSaleRecord(state, offer, buyer, buyerPrice));

  await writeState(state);

  return {
    notice: `Achat validé : ${offer.label} pour ${buyerPrice} Ether.`,
  };
}

export async function cancelMarketplaceOffer(playerId: string, offerId: number) {
  const state = await readState();
  const player = getPlayer(state, playerId);

  const offer = state.offers.find(
    (entry) => entry.offerId === offerId && entry.sellerId === playerId,
  );

  if (!offer || offer.state !== "OPEN") {
    throw new Error("Offre introuvable ou déjà fermée.");
  }

  offer.state = "CLOSED";

  player.inventory.unshift({
    instanceId: `inv-${state.nextInventoryId++}`,
    itemType: offer.itemType,
    label: offer.label,
    sprite: offer.sprite,
    category: offer.category,
    limitedStack: offer.limitedStack,
    limitedNumber: offer.limitedNumber,
  });

  await writeState(state);

  return {
    notice: `${offer.label} a été retiré du marketplace.`,
  };
}

export async function claimMarketplaceCredits(playerId: string) {
  const state = await readState();
  const player = getPlayer(state, playerId);

  const amount = player.pendingEther;
  if (amount <= 0) {
    return {
      notice: "Aucun gain à récupérer.",
    };
  }

  player.pendingEther = 0;
  player.ether += amount;

  await writeState(state);

  return {
    notice: `${amount} Ether récupérés.`,
  };
}

export async function resetMarketplaceState() {
  const state = createInitialState();
  await writeState(state);

  return {
    notice: "Marketplace EtherWorld réinitialisé.",
  };
}
