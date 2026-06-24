import Link from "next/link";
import { notFound } from "next/navigation";
import {
  affiliationTypeLabel,
  formatPlayTime,
  getCatalogCourses,
  getCatalogFaculties,
  getCatalogUniversities,
  getPlayer,
  getPlayerStats,
  type PlayerProfile,
  type PlayerStats,
} from "@/lib/api";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;

  let profile: PlayerProfile;
  let stats: PlayerStats | null = null;
  let statsError: string | null = null;

  try {
    profile = await getPlayer(id);
  } catch {
    notFound();
  }

  try {
    stats = await getPlayerStats(id);
  } catch (e) {
    statsError = e instanceof Error ? e.message : "Falha ao carregar stats";
  }

  const affiliationLabels = await resolveAffiliationLabels(profile);

  return (
    <main>
      <p className="breadcrumb">
        <Link href="/">← CampusWorld</Link>
      </p>

      <h1>{profile.username}</h1>
      <p className="subtitle">Perfil do jogador</p>

      <div className="affiliation-badges" style={{ marginBottom: "1rem" }}>
        {profile.affiliationType === "guest" ? (
          <span className="pill pill-affiliation-guest">Visitante</span>
        ) : (
          <>
            {profile.affiliationType && (
              <span className="pill">{affiliationTypeLabel(profile.affiliationType)}</span>
            )}
            {affiliationLabels.university && (
              <span className="pill">{affiliationLabels.university}</span>
            )}
            {affiliationLabels.faculty && (
              <span className="pill">{affiliationLabels.faculty}</span>
            )}
            {affiliationLabels.course && (
              <span className="pill">{affiliationLabels.course}</span>
            )}
          </>
        )}
      </div>

      <div className="grid two">
        <section className="card">
          <h2>Status</h2>
          <ul className="meta">
            <li>
              <span>Conta</span>
              <span className={`pill status-${profile.status}`}>{profile.status}</span>
            </li>
            <li>
              <span>Trust</span>
              <span>{profile.trustScore}</span>
            </li>
            <li>
              <span>Sponsor score</span>
              <span>{profile.sponsorScore}</span>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>Guilda</h2>
          {profile.guild ? (
            <ul className="meta">
              <li>
                <span>Nome</span>
                <Link href={`/guilds/${profile.guild.slug}`}>{profile.guild.name}</Link>
              </li>
              <li>
                <span>Slug</span>
                <span>{profile.guild.slug}</span>
              </li>
            </ul>
          ) : (
            <p className="empty">Sem guilda.</p>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Estatísticas</h2>
        {statsError ? (
          <p className="error">{statsError}</p>
        ) : stats ? (
          <>
            <div className="grid two">
              <div>
                <div className="stat-label">Playtime total</div>
                <div className="stat">{formatPlayTime(stats.totalPlayTimeSecs)}</div>
              </div>
              <div>
                <div className="stat-label">Mob kills</div>
                <div className="stat">{stats.totalMobKills}</div>
              </div>
            </div>
            {stats.byServer.length > 0 ? (
              <ul className="players" style={{ marginTop: "1rem" }}>
                {stats.byServer.map((row) => (
                  <li key={row.serverSlug}>
                    <span>{row.serverSlug}</span>
                    <span>
                      {formatPlayTime(row.playTimeSecs)} · {row.mobKills} kills
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">Nenhuma stat registrada ainda.</p>
            )}
          </>
        ) : (
          <p className="empty">—</p>
        )}
      </section>
    </main>
  );
}

async function resolveAffiliationLabels(profile: PlayerProfile) {
  if (profile.affiliationType === "guest") {
    return { university: "", faculty: "", course: "" };
  }

  let university = profile.universitySlug ?? "";
  let faculty = profile.facultySlug ?? "";
  let course = profile.courseSlug ?? "";

  try {
    if (profile.universitySlug) {
      const { universities } = await getCatalogUniversities();
      university = universities.find((u) => u.slug === profile.universitySlug)?.name ?? university;
    }
    if (profile.universitySlug && profile.facultySlug) {
      const { faculties } = await getCatalogFaculties(profile.universitySlug);
      const row = faculties.find((f) => f.slug === profile.facultySlug);
      faculty = row ? `${row.shortAbbr} — ${row.name}` : faculty;
    }
    if (profile.facultySlug && profile.courseSlug) {
      const { courses } = await getCatalogCourses(profile.facultySlug);
      const row = courses.find((c) => c.slug === profile.courseSlug);
      course = row ? `${row.shortAbbr} — ${row.name}` : course;
    }
  } catch {
    // keep slugs as fallback
  }

  return { university, faculty, course };
}
