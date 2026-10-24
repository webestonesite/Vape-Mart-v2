import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  getAuthState,
  setupPassword,
  login,
  getPanelData,
  getPanelExtras,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  createCollection,
  deleteCollection,
  saveAction,
} from "@/lib/admin-panel";

/**
 * Single endpoint for the /admin panel.
 * POST { action: "setup" | "login" | "logout" | "data" | "save", ... }
 * The session cookie is an HMAC derived from the stored password hash;
 * the password itself never leaves the login form.
 */

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

async function sessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function GET() {
  try {
    const state = await getAuthState(await sessionToken());
    return NextResponse.json(state);
  } catch (e) {
    return NextResponse.json(
      { setupNeeded: false, authed: false, error: e instanceof Error ? e.message : "Auth check failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "setup") {
      const token = await setupPassword(String(body.code || ""), String(body.password || ""));
      const res = NextResponse.json({ ok: true, authed: true });
      res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
      return res;
    }

    if (action === "login") {
      const token = await login(String(body.password || ""));
      const res = NextResponse.json({ ok: true, authed: true });
      res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
      return res;
    }

    if (action === "logout") {
      const res = NextResponse.json({ ok: true, authed: false });
      res.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
      return res;
    }

    const state = await getAuthState(await sessionToken());
    if (!state.authed) {
      return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
    }

    if (action === "data") {
      const [data, extras] = await Promise.all([getPanelData(), getPanelExtras()]);
      return NextResponse.json({ ok: true, data: { ...data, ...extras } });
    }

    if (action === "productDetail") {
      const detail = await getProductDetail(String(body.id || ""));
      return NextResponse.json({ ok: true, detail });
    }

    if (action === "product.create") {
      const result = await createProduct(body.payload ?? {});
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "product.update") {
      const result = await updateProduct(body.payload ?? {});
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "product.delete") {
      const result = await deleteProduct(String(body.id || ""));
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "collection.create") {
      const result = await createCollection(String(body.title || ""));
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "collection.delete") {
      const result = await deleteCollection(String(body.id || ""));
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "save") {
      const result = await saveAction(String(body.saveAction || ""), body.payload ?? {});
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Something went wrong." },
      { status: 400 }
    );
  }
}
