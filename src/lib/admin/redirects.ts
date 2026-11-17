import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import type { AdminRedirect, PageInfo, SaveResult } from "./types";

interface RedirectsQueryResponse {
  urlRedirects?: {
    nodes?: { id?: string; path?: string; target?: string }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
}

interface RedirectCreateResponse {
  urlRedirectCreate?: {
    urlRedirect?: { id?: string };
    userErrors?: { message: string }[];
  };
}

interface RedirectDeleteResponse {
  urlRedirectDelete?: {
    deletedUrlRedirectId?: string;
    userErrors?: { message: string }[];
  };
}

export async function getAdminRedirects(opts: { limit?: number; after?: string | null } = {}): Promise<{
  redirects: AdminRedirect[];
  pageInfo: PageInfo;
}> {
  const limit = Math.min(Math.max(opts.limit || 50, 1), 250);
  const d = await gql<RedirectsQueryResponse>(
    `query PanelRedirects($first: Int!, $after: String) {
       urlRedirects(first: $first, after: $after) {
         nodes { id path target }
         pageInfo { hasNextPage endCursor }
       }
     }`,
    { first: limit, after: opts.after || null }
  );

  const redirects: AdminRedirect[] = (d.urlRedirects?.nodes ?? []).map((r) => ({
    id: r.id || "",
    path: r.path || "",
    target: r.target || "",
  }));

  const pageInfo: PageInfo = {
    hasNextPage: !!d.urlRedirects?.pageInfo?.hasNextPage,
    endCursor: d.urlRedirects?.pageInfo?.endCursor || null,
  };

  return { redirects, pageInfo };
}

export async function listAllRedirects(): Promise<AdminRedirect[]> {
  const out: AdminRedirect[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const res = await getAdminRedirects({ limit: 100, after });
    out.push(...res.redirects);
    if (!res.pageInfo.hasNextPage) break;
    after = res.pageInfo.endCursor;
  }
  return out;
}

export async function createAdminRedirect(p: { path: string; target: string }): Promise<SaveResult> {
  const path = String(p.path || "").trim();
  const target = String(p.target || "").trim();
  if (!path.startsWith("/")) throw new Error("Redirect path must start with / (e.g. /old-page).");
  if (!target) throw new Error("Redirect target is required.");
  const d = await gql<RedirectCreateResponse>(
    `mutation RedirectCreate($path: String!, $target: String!) {
       urlRedirectCreate(urlRedirect: { path: $path, target: $target }) {
         urlRedirect { id }
         userErrors { message }
       }
     }`,
    { path, target }
  );
  const errs = d.urlRedirectCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Redirect added.", id: d.urlRedirectCreate?.urlRedirect?.id };
}

export async function deleteAdminRedirect(id: string): Promise<SaveResult> {
  const d = await gql<RedirectDeleteResponse>(
    `mutation RedirectDelete($id: ID!) {
       urlRedirectDelete(id: $id) {
         deletedUrlRedirectId
         userErrors { message }
       }
     }`,
    { id }
  );
  const errs = d.urlRedirectDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Redirect deleted.", id };
}
