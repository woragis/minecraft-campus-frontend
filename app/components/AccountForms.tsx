"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createGuildAction,
  fetchCoursesCatalogAction,
  fetchFacultiesCatalogAction,
  linkWithCode,
  logoutFormAction,
  sendInvite,
  updateAffiliationAction,
  type ActionResult,
} from "@/app/actions/account";
import {
  affiliationTypeLabel,
  type Course,
  type Faculty,
  type University,
} from "@/lib/api";

type Props = {
  loggedIn: boolean;
  username?: string;
  status?: string;
  guildSlug?: string;
  affiliationType?: string;
  universitySlug?: string;
  facultySlug?: string;
  courseSlug?: string;
  universities?: University[];
};

export function AccountForms({
  loggedIn,
  username,
  status,
  guildSlug,
  affiliationType,
  universitySlug,
  facultySlug,
  courseSlug,
  universities = [],
}: Props) {
  const [linkState, linkAction, linkPending] = useActionState(linkWithCode, null);
  const [inviteState, inviteAction, invitePending] = useActionState(sendInvite, null);
  const [guildState, guildAction, guildPending] = useActionState(createGuildAction, null);
  const [logoutState, logoutAction, logoutPending] = useActionState(logoutFormAction, null);
  const [affiliationState, affiliationAction, affiliationPending] = useActionState(
    updateAffiliationAction,
    null,
  );

  if (!loggedIn) {
    return (
      <section className="card">
        <h2>Vincular conta</h2>
        <p className="subtitle" style={{ marginBottom: "1rem" }}>
          No Minecraft: <strong>/campus link</strong> → cole o código abaixo (válido por 5 min).
        </p>
        <form action={linkAction} className="stack">
          <input name="code" placeholder="Código (ex.: AB12CD34)" className="input" autoComplete="off" />
          <button type="submit" className="btn" disabled={linkPending}>
            {linkPending ? "Vinculando…" : "Conectar"}
          </button>
        </form>
        <Feedback state={linkState} />
      </section>
    );
  }

  const isGuest = affiliationType === "guest";

  return (
    <>
      <section className="card">
        <h2>Sessão</h2>
        <ul className="meta">
          <li>
            <span>Jogador</span>
            <span>{username}</span>
          </li>
          <li>
            <span>Status</span>
            <span className={`pill status-${status}`}>{status}</span>
          </li>
          <li>
            <span>Afiliação</span>
            <span>
              {isGuest ? (
                <span className="pill pill-affiliation-guest">Visitante</span>
              ) : (
                affiliationTypeLabel(affiliationType)
              )}
            </span>
          </li>
          <li>
            <span>Guilda</span>
            <span>{guildSlug ? `/${guildSlug}` : "—"}</span>
          </li>
        </ul>
        <form action={logoutAction} style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn secondary" disabled={logoutPending}>
            {logoutPending ? "Saindo…" : "Sair do site"}
          </button>
        </form>
        <Feedback state={logoutState} />
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Afiliação acadêmica</h2>
        {isGuest ? (
          <p className="empty">Contas visitantes não podem alterar a afiliação.</p>
        ) : (
          <AffiliationPicker
            action={affiliationAction}
            pending={affiliationPending}
            universities={universities}
            initialType={affiliationType ?? "student"}
            initialUniversity={universitySlug}
            initialFaculty={facultySlug}
            initialCourse={courseSlug}
          />
        )}
        <Feedback state={affiliationState} />
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Convidar jogador</h2>
        <form action={inviteAction} className="stack">
          <input name="targetUsername" placeholder="Nick do convidado" className="input" />
          <label className="checkbox-row">
            <input type="checkbox" name="inviteAsGuest" />
            <span>Convidar como visitante (sem vínculo acadêmico)</span>
          </label>
          <button type="submit" className="btn" disabled={invitePending || status === "probation"}>
            {invitePending ? "Criando…" : "Criar convite"}
          </button>
        </form>
        {status === "probation" && (
          <p className="empty">Contas em probation não podem convidar.</p>
        )}
        <Feedback state={inviteState} />
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Criar guilda</h2>
        <form action={guildAction} className="stack">
          <input name="name" placeholder="Nome da guilda" className="input" />
          <button type="submit" className="btn" disabled={guildPending || status === "probation"}>
            {guildPending ? "Criando…" : "Criar guilda"}
          </button>
        </form>
        {status === "probation" && (
          <p className="empty">Contas em probation não podem criar guildas.</p>
        )}
        <Feedback state={guildState} />
      </section>
    </>
  );
}

type AffiliationPickerProps = {
  action: (payload: FormData) => void;
  pending: boolean;
  universities: University[];
  initialType: string;
  initialUniversity?: string;
  initialFaculty?: string;
  initialCourse?: string;
};

function AffiliationPicker({
  action,
  pending,
  universities,
  initialType,
  initialUniversity,
  initialFaculty,
  initialCourse,
}: AffiliationPickerProps) {
  const [affiliationType, setAffiliationType] = useState(initialType);
  const [universitySlug, setUniversitySlug] = useState(initialUniversity ?? "");
  const [facultySlug, setFacultySlug] = useState(initialFaculty ?? "");
  const [courseSlug, setCourseSlug] = useState(initialCourse ?? "");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const needsCatalog = affiliationType === "student" || affiliationType === "alumni";

  useEffect(() => {
    if (!universitySlug) {
      setFaculties([]);
      return;
    }
    let cancelled = false;
    fetchFacultiesCatalogAction(universitySlug)
      .then((rows) => {
        if (!cancelled) {
          setFaculties(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFaculties([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [universitySlug]);

  useEffect(() => {
    if (!facultySlug) {
      setCourses([]);
      return;
    }
    let cancelled = false;
    fetchCoursesCatalogAction(facultySlug)
      .then((rows) => {
        if (!cancelled) {
          setCourses(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [facultySlug]);

  return (
    <form action={action} className="stack">
      <label className="field-label">
        Tipo
        <select
          name="affiliationType"
          className="input"
          value={affiliationType}
          onChange={(e) => setAffiliationType(e.target.value)}
        >
          <option value="student">Estudante</option>
          <option value="staff">Servidor</option>
          <option value="alumni">Egresso</option>
        </select>
      </label>

      {needsCatalog && (
        <>
          <label className="field-label">
            Universidade
            <select
              name="universitySlug"
              className="input"
              value={universitySlug}
              onChange={(e) => {
                setUniversitySlug(e.target.value);
                setFacultySlug("");
                setCourseSlug("");
              }}
              required
            >
              <option value="">Selecione…</option>
              {universities.map((uni) => (
                <option key={uni.slug} value={uni.slug}>
                  {uni.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Centro / Faculdade
            <select
              name="facultySlug"
              className="input"
              value={facultySlug}
              onChange={(e) => {
                setFacultySlug(e.target.value);
                setCourseSlug("");
              }}
              required
              disabled={!universitySlug || faculties.length === 0}
            >
              <option value="">Selecione…</option>
              {faculties.map((fac) => (
                <option key={fac.slug} value={fac.slug}>
                  {fac.shortAbbr} — {fac.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Curso
            <select
              name="courseSlug"
              className="input"
              value={courseSlug}
              onChange={(e) => setCourseSlug(e.target.value)}
              required
              disabled={!facultySlug || courses.length === 0}
            >
              <option value="">Selecione…</option>
              {courses.map((course) => (
                <option key={course.slug} value={course.slug}>
                  {course.shortAbbr} — {course.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Salvando…" : "Salvar afiliação"}
      </button>
    </form>
  );
}

function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) {
    return null;
  }
  return (
    <p className={state.ok ? "success" : "error"} style={{ marginTop: "0.75rem" }}>
      {state.ok ? state.message : state.error}
    </p>
  );
}
