const API_URL = process.env.API_URL ?? "http://127.0.0.1:8080";

export type OnlinePlayer = {
  playerId: string;
  username: string;
  serverSlug: string;
  platform?: string;
  guildId?: string;
  since: string;
};

export type ServerPresence = {
  slug: string;
  onlineCount: number;
  players: OnlinePlayer[];
};

export type PresenceOverview = {
  enabled: boolean;
  totalOnline: number;
  servers: ServerPresence[];
};

export type Guild = {
  id: string;
  slug: string;
  name: string;
  memberCount?: number;
};

export type GuildPresence = {
  guildId: string;
  onlineCount: number;
  members: OnlinePlayer[];
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 15 } });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getPresenceOverview() {
  return apiGet<PresenceOverview>("/v1/presence/overview");
}

export function getGuilds() {
  return apiGet<{ guilds: Guild[] }>("/v1/guilds");
}

export function getGuildPresence(guildId: string) {
  return apiGet<GuildPresence>(`/v1/presence/guilds/${guildId}`);
}
