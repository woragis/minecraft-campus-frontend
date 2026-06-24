import type { Guild, PlayerProfile } from "@/lib/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8080";

export type MeProfile = PlayerProfile;

type ApiErrorBody = {
  message?: string;
  code?: string;
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return body.message ?? `Erro ${res.status}`;
  } catch {
    return `Erro ${res.status}`;
  }
}

export async function fetchMe(token: string): Promise<MeProfile> {
  const res = await fetch(`${API_URL}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<MeProfile>;
}

export async function mePost<T>(token: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export type AffiliationPatchBody = {
  affiliationType: string;
  universitySlug?: string | null;
  facultySlug?: string | null;
  courseSlug?: string | null;
};

export async function patchAffiliation(token: string, body: AffiliationPatchBody): Promise<MeProfile> {
  const res = await fetch(`${API_URL}/v1/me/affiliation`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<MeProfile>;
}

export type CreatedGuild = Guild;

export type CreatedInvite = {
  id: string;
  code: string;
  targetUsername: string;
  status: string;
};

export async function redeemLinkCode(code: string) {
  const res = await fetch(`${API_URL}/v1/web/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<{
    token: string;
    username: string;
    playerId: string;
  }>;
}

export async function logoutSession(token: string) {
  await fetch(`${API_URL}/v1/web/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}
