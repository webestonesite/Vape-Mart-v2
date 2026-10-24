import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getAuthState } from "@/lib/admin-panel";
import { shopifyAdminMutation as gql } from "@/lib/shopify";

/**
 * POST multipart/form-data { file } -> { resourceUrl, filename }
 * Uses Shopify staged uploads: the server uploads the file to Shopify's
 * storage, then the panel attaches resourceUrl as product media or a
 * file (hero image) via the normal create mutations. Auth-gated like
 * the rest of the panel.
 */

export async function POST(req: Request) {
  try {
    const store = await cookies();
    const state = await getAuthState(store.get(SESSION_COOKIE)?.value);
    if (!state.authed) {
      return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
    }
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ ok: false, error: "File too large (max 10 MB)." }, { status: 400 });

    const filename = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "-");
    const staged = await gql<any>(
      `mutation Staged($input: [StagedUploadInput!]!) {
         stagedUploadsCreate(input: $input) {
           stagedTargets { url resourceUrl parameters { name value } }
           userErrors { message }
         }
       }`,
      { input: [{ filename, mimeType: file.type || "application/octet-stream", resource: "IMAGE", fileSize: String(file.size) }] }
    );
    const errs = staged.stagedUploadsCreate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
    const target = staged.stagedUploadsCreate?.stagedTargets?.[0];
    if (!target) throw new Error("Shopify did not return an upload target.");

    const body = new FormData();
    for (const param of target.parameters ?? []) body.append(param.name, param.value);
    body.append("file", file);
    const put = await fetch(target.url, { method: "POST", body });
    if (!put.ok) throw new Error(`Upload to Shopify storage failed (HTTP ${put.status}).`);

    return NextResponse.json({ ok: true, resourceUrl: target.resourceUrl as string, filename });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Upload failed." },
      { status: 400 }
    );
  }
}
