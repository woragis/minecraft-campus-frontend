"use client";

import { useActionState } from "react";
import {
  createGuildAction,
  linkWithCode,
  logoutFormAction,
  sendInvite,
  type ActionResult,
} from "@/app/actions/account";

type Props = {
  loggedIn: boolean;
  username?: string;
  status?: string;
  guildSlug?: string;
};

export function AccountForms({ loggedIn, username, status, guildSlug }: Props) {
  const [linkState, linkAction, linkPending] = useActionState(linkWithCode, null);
  const [inviteState, inviteAction, invitePending] = useActionState(sendInvite, null);
  const [guildState, guildAction, guildPending] = useActionState(createGuildAction, null);
  const [logoutState, logoutAction, logoutPending] = useActionState(logoutFormAction, null);

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
        <h2>Convidar jogador</h2>
        <form action={inviteAction} className="stack">
          <input name="targetUsername" placeholder="Nick do convidado" className="input" />
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
