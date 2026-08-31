import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth-session";
import {
  clearUserCapturedCodes,
  countUserCapturedCodes,
  createCapturedCodes,
  findExistingCapturedClientIds,
  listUserCapturedCodes,
} from "@/lib/db/queries";
import { getUserPlan } from "@/lib/plan-enforcement";

const MAX_BATCH_SIZE = 50;
const MAX_URL_LENGTH = 8_192;

type IncomingCapture = {
  clientId?: unknown;
  rawValue?: unknown;
  normalizedUrl?: unknown;
  host?: unknown;
  source?: unknown;
  capturedAt?: unknown;
};

function parseCapture(value: IncomingCapture, userId: string) {
  if (
    typeof value.clientId !== "string" ||
    value.clientId.length < 3 ||
    value.clientId.length > 100 ||
    typeof value.rawValue !== "string" ||
    value.rawValue.length > MAX_URL_LENGTH ||
    typeof value.capturedAt !== "string"
  ) {
    return null;
  }

  let url: URL;
  let capturedAt: Date;
  try {
    url = new URL(value.rawValue);
    capturedAt = new Date(value.capturedAt);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || Number.isNaN(capturedAt.getTime())) {
    return null;
  }

  const source = value.source === "photo" || value.source === "web" || value.source === "created" ? value.source : "camera";
  return {
    id: crypto.randomUUID(),
    clientId: value.clientId,
    userId,
    kind: "url",
    rawValue: value.rawValue,
    normalizedUrl: url.toString(),
    host: url.hostname.replace(/^www\./, ""),
    source,
    capturedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const page = Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10) || 50));
    const [result, plan] = await Promise.all([
      listUserCapturedCodes({ userId: user.id, page, limit }),
      getUserPlan(user.id),
    ]);
    return NextResponse.json({
      ...result,
      plan: plan.plan,
      cloudLimit: plan.limits.maxSyncedCaptures,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to list captured codes", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body: unknown = await request.json();
    const incoming = Array.isArray(body) ? body : (body as { captures?: unknown })?.captures;
    if (!Array.isArray(incoming) || incoming.length === 0 || incoming.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `Send between 1 and ${MAX_BATCH_SIZE} captures` }, { status: 400 });
    }

    const parsed = incoming
      .map((value) => parseCapture(value as IncomingCapture, user.id))
      .filter((value): value is NonNullable<typeof value> => value !== null);
    if (parsed.length !== incoming.length) {
      return NextResponse.json({ error: "One or more captures are invalid" }, { status: 400 });
    }

    const [plan, currentCount, existingClientIds] = await Promise.all([
      getUserPlan(user.id),
      countUserCapturedCodes(user.id),
      findExistingCapturedClientIds(user.id, parsed.map((capture) => capture.clientId)),
    ]);
    const newCaptures = parsed.filter((capture) => !existingClientIds.has(capture.clientId));
    const limit = plan.limits.maxSyncedCaptures;
    const remaining = limit === -1 ? newCaptures.length : Math.max(0, limit - currentCount);
    if (remaining === 0 && newCaptures.length > 0) {
      return NextResponse.json({ error: "Cloud history limit reached", code: "LIMIT_REACHED", limit }, { status: 403 });
    }

    const created = await createCapturedCodes(newCaptures.slice(0, remaining));
    return NextResponse.json({
      created,
      accepted: existingClientIds.size + created.length,
      existing: existingClientIds.size,
      limit,
    }, { status: created.length > 0 ? 201 : 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to save captured codes", error);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireApiUser();
    const deleted = await clearUserCapturedCodes(user.id);
    return NextResponse.json({ deleted: deleted.length });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to clear captured codes", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
