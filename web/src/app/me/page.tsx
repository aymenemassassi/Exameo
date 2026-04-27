import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

type MeResponse = {
  id: string;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  primaryRole: string;
  roles: string[];
  locale: string;
};

async function fetchMe(accessToken: string): Promise<MeResponse | { error: string }> {
  const apiUrl = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${apiUrl}/api/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return { error: `Backend a renvoyé ${res.status}` };
    }
    return (await res.json()) as MeResponse;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

export default async function MePage() {
  const session = await auth();
  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Authentification requise</h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          Vous devez être connecté pour voir cette page.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("keycloak", { redirectTo: "/me" });
          }}
        >
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Se connecter avec Keycloak
          </button>
        </form>
      </div>
    );
  }

  if (session.error === "RefreshAccessTokenError") {
    redirect("/login");
  }

  const me = session.accessToken ? await fetchMe(session.accessToken) : { error: "Pas de token" };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mon profil</h1>

      {"error" in me ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Backend indisponible.</strong> {me.error}. La page lit aujourd'hui les claims du JWT côté
          frontend ; la résolution complète passera par le user-service via l'api-gateway.
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2">
          <Field label="Nom" value={`${me.firstName ?? ""} ${me.lastName ?? ""}`.trim() || me.username} />
          <Field label="Email" value={me.email} />
          <Field label="Rôle principal" value={me.primaryRole} />
          <Field label="Tous les rôles" value={me.roles.join(", ")} />
          <Field label="Identifiant Keycloak" value={me.keycloakId} mono />
          <Field label="ID local" value={me.id} mono />
          <Field label="Langue" value={me.locale} />
        </dl>
      )}

      <details className="rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer font-medium">Claims du JWT (debug)</summary>
        <pre className="mt-3 overflow-auto rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-950">
{JSON.stringify({ user: session.user, roles: session.user.roles }, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : "font-medium"}>{value || "—"}</dd>
    </div>
  );
}
