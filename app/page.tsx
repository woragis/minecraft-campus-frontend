import Link from "next/link";
import {
  getGuildPresence,
  getGuilds,
  getPresenceOverview,
  type Guild,
  type GuildPresence,
} from "@/lib/api";

async function loadGuildPresence(guilds: Guild[]): Promise<GuildPresence[]> {
  const results = await Promise.allSettled(
    guilds.map((g) => getGuildPresence(g.id)),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<GuildPresence> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((p) => p.onlineCount > 0);
}

export default async function HomePage() {
  let overviewError: string | null = null;
  let guildsError: string | null = null;

  let overview = null;
  let guildsOnline: GuildPresence[] = [];

  let allGuilds: Guild[] = [];

  try {
    overview = await getPresenceOverview();
  } catch (e) {
    overviewError = e instanceof Error ? e.message : "Falha ao carregar presença";
  }

  try {
    const { guilds } = await getGuilds();
    allGuilds = guilds;
    guildsOnline = await loadGuildPresence(guilds);
  } catch (e) {
    guildsError = e instanceof Error ? e.message : "Falha ao carregar guildas";
  }

  return (
    <main>
      <h1>CampusWorld</h1>
      <p className="subtitle">Jogadores online agora · universitários no Minecraft</p>

      <div className="grid two">
        <section className="card">
          <h2>Total online</h2>
          {overviewError ? (
            <p className="error">{overviewError}</p>
          ) : (
            <>
              <div className="stat">{overview?.totalOnline ?? 0}</div>
              <span className={`pill ${overview?.enabled ? "on" : ""}`}>
                {overview?.enabled ? "Redis ativo" : "Presença desativada"}
              </span>
            </>
          )}
        </section>

        <section className="card">
          <h2>Servidores</h2>
          {overviewError || !overview ? (
            <p className="empty">—</p>
          ) : (
            <ul className="players">
              {overview.servers.map((srv) => (
                <li key={srv.slug}>
                  <span>{srv.slug}</span>
                  <span>{srv.onlineCount}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Jogadores por mundo</h2>
        {overviewError || !overview ? (
          <p className="empty">Nenhum dado disponível.</p>
        ) : overview.totalOnline === 0 ? (
          <p className="empty">Ninguém online no momento.</p>
        ) : (
          overview.servers.map((srv) =>
            srv.players.length > 0 ? (
              <div key={srv.slug} style={{ marginBottom: "1rem" }}>
                <strong>{srv.slug}</strong>
                <ul className="players">
                  {srv.players.map((p) => (
                    <li key={p.playerId}>
                      <Link href={`/players/${p.playerId}`}>{p.username}</Link>
                      <span>{p.platform ?? "java"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )
        )}
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Guildas com membros online</h2>
        {guildsError ? (
          <p className="error">{guildsError}</p>
        ) : guildsOnline.length === 0 ? (
          <p className="empty">Nenhuma guilda com jogadores online.</p>
        ) : (
          guildsOnline.map((g) => (
            <div key={g.guildId} style={{ marginBottom: "1rem" }}>
              <strong>
                {g.onlineCount} online
              </strong>
              <ul className="players">
                {g.members.map((m) => (
                  <li key={m.playerId}>
                    <Link href={`/players/${m.playerId}`}>{m.username}</Link>
                    <span>{m.serverSlug}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Guildas</h2>
        {allGuilds.length === 0 ? (
          <p className="empty">Nenhuma guilda cadastrada.</p>
        ) : (
          <ul className="players">
            {allGuilds.map((g) => (
              <li key={g.id}>
                <Link href={`/guilds/${g.slug}`}>{g.name}</Link>
                <span>{g.memberCount ?? 0} membros</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
