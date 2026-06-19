"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  mePost,
  redeemLinkCode,
  logoutSession,
  type CreatedGuild,
  type CreatedInvite,
} from "@/lib/me";
import { getSessionToken, SESSION_COOKIE } from "@/lib/session";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export type { ActionResult };

async function requireToken(): Promise<string | ActionResult> {
  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Entre com /campus link no jogo primeiro." };
  }
  return token;
}

export async function linkWithCode(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) {
    return { ok: false, error: "Informe o código gerado in-game." };
  }
  try {
    const session = await redeemLinkCode(code);
    const store = await cookies();
    store.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    revalidatePath("/conta");
    revalidatePath("/");
    return { ok: true, message: `Conta ${session.username} conectada ao site.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao vincular conta." };
  }
}

export async function logoutFormAction(
  _prev: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  return logoutAccount();
}

async function logoutAccount(): Promise<ActionResult> {
  const token = await getSessionToken();
  if (token) {
    try {
      await logoutSession(token);
    } catch {
      // ignore
    }
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  revalidatePath("/conta");
  revalidatePath("/");
  return { ok: true, message: "Sessão encerrada." };
}

export async function sendInvite(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tokenOrErr = await requireToken();
  if (typeof tokenOrErr !== "string") {
    return tokenOrErr;
  }
  const targetUsername = String(formData.get("targetUsername") ?? "").trim();
  if (!targetUsername) {
    return { ok: false, error: "Informe o nick do convidado." };
  }
  try {
    const invite = await mePost<CreatedInvite>(tokenOrErr, "/v1/me/invites", { targetUsername });
    revalidatePath("/conta");
    return { ok: true, message: `Convite ${invite.code} criado para ${invite.targetUsername}.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao criar convite." };
  }
}

export async function createGuildAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tokenOrErr = await requireToken();
  if (typeof tokenOrErr !== "string") {
    return tokenOrErr;
  }
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "Informe o nome da guilda." };
  }
  try {
    const guild = await mePost<CreatedGuild>(tokenOrErr, "/v1/me/guilds", { name });
    revalidatePath("/conta");
    revalidatePath("/");
    revalidatePath(`/guilds/${guild.slug}`);
    return { ok: true, message: `Guilda ${guild.name} criada (${guild.slug}).` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao criar guilda." };
  }
}

export async function joinGuildAction(slug: string): Promise<ActionResult> {
  const tokenOrErr = await requireToken();
  if (typeof tokenOrErr !== "string") {
    return tokenOrErr;
  }
  try {
    await mePost(tokenOrErr, `/v1/me/guilds/${encodeURIComponent(slug)}/join`);
    revalidatePath("/conta");
    revalidatePath(`/guilds/${slug}`);
    revalidatePath("/");
    return { ok: true, message: `Você entrou na guilda ${slug}.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao entrar na guilda." };
  }
}

export async function leaveGuildAction(slug: string): Promise<ActionResult> {
  const tokenOrErr = await requireToken();
  if (typeof tokenOrErr !== "string") {
    return tokenOrErr;
  }
  try {
    await mePost(tokenOrErr, `/v1/me/guilds/${encodeURIComponent(slug)}/leave`);
    revalidatePath("/conta");
    revalidatePath(`/guilds/${slug}`);
    revalidatePath("/");
    return { ok: true, message: `Você saiu da guilda ${slug}.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao sair da guilda." };
  }
}

export async function joinGuildFormAction(
  slug: string,
  _prev: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  return joinGuildAction(slug);
}

export async function leaveGuildFormAction(
  slug: string,
  _prev: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  return leaveGuildAction(slug);
}
