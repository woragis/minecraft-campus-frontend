import Link from "next/link";
import { AccountForms } from "@/app/components/AccountForms";
import { fetchMe } from "@/lib/me";
import { getSessionToken } from "@/lib/session";

export default async function AccountPage() {
  const token = await getSessionToken();
  let profile = null;
  let profileError: string | null = null;

  if (token) {
    try {
      profile = await fetchMe(token);
    } catch (e) {
      profileError = e instanceof Error ? e.message : "Sessão inválida";
    }
  }

  return (
    <main>
      <p className="breadcrumb">
        <Link href="/">← CampusWorld</Link>
      </p>

      <h1>Minha conta</h1>
      <p className="subtitle">Vincule o personagem do Minecraft e gerencie convites e guildas.</p>

      {profileError && <p className="error">{profileError}</p>}

      <AccountForms
        loggedIn={!!profile}
        username={profile?.username}
        status={profile?.status}
        guildSlug={profile?.guild?.slug}
      />
    </main>
  );
}
