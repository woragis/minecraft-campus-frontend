"use client";

import { useActionState } from "react";
import {
  joinGuildFormAction,
  leaveGuildFormAction,
  type ActionResult,
} from "@/app/actions/account";

type Props = {
  slug: string;
  isMember: boolean;
  loggedIn: boolean;
};

export function GuildPanel({ slug, isMember, loggedIn }: Props) {
  const joinAction = joinGuildFormAction.bind(null, slug);
  const leaveAction = leaveGuildFormAction.bind(null, slug);
  const [joinState, joinFormAction, joinPending] = useActionState(joinAction, null);
  const [leaveState, leaveFormAction, leavePending] = useActionState(leaveAction, null);

  if (!loggedIn) {
    return (
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Ações</h2>
        <p className="empty">
          Entre no jogo, use <strong>/campus link</strong> e vincule em{" "}
          <a href="/conta">/conta</a> para entrar ou sair da guilda pelo site.
        </p>
      </section>
    );
  }

  const feedback: ActionResult | null = joinState ?? leaveState;

  return (
    <section className="card" style={{ marginTop: "1rem" }}>
      <h2>Ações</h2>
      {feedback && (
        <p className={feedback.ok ? "success" : "error"}>
          {feedback.ok ? feedback.message : feedback.error}
        </p>
      )}
      {isMember ? (
        <form action={leaveFormAction}>
          <button type="submit" className="btn" disabled={leavePending}>
            {leavePending ? "Saindo…" : "Sair da guilda"}
          </button>
        </form>
      ) : (
        <form action={joinFormAction}>
          <button type="submit" className="btn" disabled={joinPending}>
            {joinPending ? "Entrando…" : `Entrar em /${slug}`}
          </button>
        </form>
      )}
    </section>
  );
}
