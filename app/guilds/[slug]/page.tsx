import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGuildBySlug,
  getGuildMembers,
  getGuildPresence,
  getPlayer,
  type Guild,
  type GuildMember,
  type GuildPresence,
} from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type MemberRow = GuildMember & { username?: string };

async function loadMemberNames(members: GuildMember[]): Promise<MemberRow[]> {
  const rows: MemberRow[] = [];
  for (const member of members) {
    try {
      const player = await getPlayer(member.playerId);
      rows.push({ ...member, username: player.username });
    } catch {
      rows.push(member);
    }
  }
  return rows;
}

export default async function GuildPage({ params }: PageProps) {
  const { slug } = await params;

  let guild: Guild;
  try {
    guild = await getGuildBySlug(slug);
  } catch {
    notFound();
  }

  let members: MemberRow[] = [];
  let presence: GuildPresence | null = null;
  let membersError: string | null = null;

  try {
    const { members: rawMembers } = await getGuildMembers(guild.id);
    members = await loadMemberNames(rawMembers);
  } catch (e) {
    membersError = e instanceof Error ? e.message : "Falha ao carregar membros";
  }

  try {
    presence = await getGuildPresence(guild.id);
  } catch {
    presence = null;
  }

  const onlineIds = new Set(presence?.members.map((m) => m.playerId) ?? []);

  return (
    <main>
      <p className="breadcrumb">
        <Link href="/">← CampusWorld</Link>
      </p>

      <h1>{guild.name}</h1>
      <p className="subtitle">/{guild.slug}</p>

      <div className="grid two">
        <section className="card">
          <h2>Resumo</h2>
          <ul className="meta">
            <li>
              <span>Membros</span>
              <span>{guild.memberCount ?? members.length}</span>
            </li>
            <li>
              <span>Trust da guilda</span>
              <span>{guild.trustScore ?? "—"}</span>
            </li>
            <li>
              <span>Online agora</span>
              <span>{presence?.onlineCount ?? 0}</span>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>Online</h2>
          {!presence || presence.onlineCount === 0 ? (
            <p className="empty">Ninguém online nesta guilda.</p>
          ) : (
            <ul className="players">
              {presence.members.map((m) => (
                <li key={m.playerId}>
                  <Link href={`/players/${m.playerId}`}>{m.username}</Link>
                  <span>{m.serverSlug}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Membros</h2>
        {membersError ? (
          <p className="error">{membersError}</p>
        ) : members.length === 0 ? (
          <p className="empty">Nenhum membro listado.</p>
        ) : (
          <ul className="players">
            {members.map((member) => (
              <li key={member.playerId}>
                <Link href={`/players/${member.playerId}`}>
                  {member.username ?? member.playerId.slice(0, 8)}
                </Link>
                <span>
                  {member.role}
                  {onlineIds.has(member.playerId) ? " · online" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
