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
  leaderId?: string;
  trustScore?: number;
  memberCount?: number;
  createdAt?: string;
};

export type GuildMember = {
  guildId: string;
  playerId: string;
  role: string;
  joinedAt: string;
};

export type GuildPresence = {
  guildId: string;
  onlineCount: number;
  members: OnlinePlayer[];
};

export type PlayerProfile = {
  id: string;
  minecraftUuid: string;
  username: string;
  status: string;
  trustScore: number;
  sponsorScore: number;
  affiliationType?: string;
  universitySlug?: string;
  facultySlug?: string;
  courseSlug?: string;
  guild?: Guild;
};

export type University = {
  slug: string;
  name: string;
  colorHex: string;
};

export type Faculty = {
  slug: string;
  universitySlug: string;
  name: string;
  shortAbbr: string;
  colorHex: string;
};

export type Course = {
  slug: string;
  facultySlug: string;
  name: string;
  shortAbbr: string;
  colorHex: string;
};

export type AffiliationType = "student" | "staff" | "guest" | "alumni";

export function affiliationTypeLabel(type?: string): string {
  switch (type) {
    case "student":
      return "Estudante";
    case "staff":
      return "Servidor";
    case "guest":
      return "Visitante";
    case "alumni":
      return "Egresso";
    default:
      return type ?? "—";
  }
}

export type PlayerStats = {
  playerId: string;
  totalPlayTimeSecs: number;
  totalMobKills: number;
  byServer: {
    serverSlug: string;
    playTimeSecs: number;
    mobKills: number;
  }[];
};

async function apiGet<T>(path: string, revalidate = 15): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
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

export function getGuildBySlug(slug: string) {
  return apiGet<Guild>(`/v1/lookup/guilds/${encodeURIComponent(slug)}`);
}

export function getGuildMembers(guildId: string) {
  return apiGet<{ members: GuildMember[] }>(`/v1/guilds/${guildId}/members`);
}

export function getGuildPresence(guildId: string) {
  return apiGet<GuildPresence>(`/v1/presence/guilds/${guildId}`);
}

export function getPlayer(id: string) {
  return apiGet<PlayerProfile>(`/v1/players/${id}`);
}

export function getPlayerStats(id: string) {
  return apiGet<PlayerStats>(`/v1/players/${id}/stats`);
}

export function getCatalogUniversities() {
  return apiGet<{ universities: University[] }>("/v1/catalog/universities", 3600);
}

export function getCatalogFaculties(universitySlug: string) {
  return apiGet<{ faculties: Faculty[] }>(
    `/v1/catalog/faculties?universitySlug=${encodeURIComponent(universitySlug)}`,
    3600,
  );
}

export function getCatalogCourses(facultySlug: string) {
  return apiGet<{ courses: Course[] }>(
    `/v1/catalog/courses?facultySlug=${encodeURIComponent(facultySlug)}`,
    3600,
  );
}

export function formatPlayTime(seconds: number): string {
  if (seconds <= 0) {
    return "0 min";
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}
