import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_MARKETPLACE_PLAYER_ID,
  buyMarketplaceOffer,
  cancelMarketplaceOffer,
  claimMarketplaceCredits,
  getMarketplaceSnapshot,
  resetMarketplaceState,
  sellMarketplaceItem,
} from "../../../lib/marketplace/localMarketplace";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const snapshot = await getMarketplaceSnapshot({
      playerId: searchParams.get("playerId") ?? DEFAULT_MARKETPLACE_PLAYER_ID,
      search: searchParams.get("search") ?? "",
      minPrice: Number(searchParams.get("minPrice") ?? "0"),
      maxPrice: Number(searchParams.get("maxPrice") ?? "0"),
      sort:
        (searchParams.get("sort") as
          | "price_asc"
          | "price_desc"
          | "sold_desc"
          | "sold_asc"
          | "count_desc"
          | "count_asc"
          | "newest") ?? "price_asc",
    });

    return NextResponse.json({
      ok: true,
      snapshot,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erreur marketplace GET",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body?.action ?? "");
    const playerId = String(body?.playerId ?? DEFAULT_MARKETPLACE_PLAYER_ID);

    let result:
      | { notice: string }
      | undefined;

    switch (action) {
      case "sell":
        result = await sellMarketplaceItem(
          playerId,
          String(body.inventoryId ?? ""),
          Number(body.price ?? 0),
        );
        break;

      case "buy":
        result = await buyMarketplaceOffer(
          playerId,
          Number(body.offerId ?? 0),
        );
        break;

      case "cancel":
        result = await cancelMarketplaceOffer(
          playerId,
          Number(body.offerId ?? 0),
        );
        break;

      case "claim":
        result = await claimMarketplaceCredits(playerId);
        break;

      case "reset":
        result = await resetMarketplaceState();
        break;

      default:
        return NextResponse.json(
          {
            ok: false,
            error: "Action marketplace inconnue.",
          },
          { status: 400 },
        );
    }

    const snapshot = await getMarketplaceSnapshot({
      playerId,
      search: "",
      minPrice: 0,
      maxPrice: 0,
      sort: "price_asc",
    });

    return NextResponse.json({
      ok: true,
      notice: result?.notice ?? "Action effectuée.",
      snapshot,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erreur marketplace POST",
      },
      { status: 400 },
    );
  }
}
