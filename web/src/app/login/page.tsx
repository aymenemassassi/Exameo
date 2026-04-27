import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold tracking-tight">Connexion à Exameo</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Authentifiez-vous via Keycloak. Comptes de démonstration :
        <code className="mx-1 rounded bg-zinc-100 px-1 dark:bg-zinc-800">student/student</code>,
        <code className="mx-1 rounded bg-zinc-100 px-1 dark:bg-zinc-800">teacher/teacher</code>,
        <code className="mx-1 rounded bg-zinc-100 px-1 dark:bg-zinc-800">proctor/proctor</code>,
        <code className="mx-1 rounded bg-zinc-100 px-1 dark:bg-zinc-800">admin/admin</code>.
      </p>

      <form
        action={async () => {
          "use server";
          await signIn("keycloak", { redirectTo: "/me" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          Se connecter via Keycloak
        </button>
      </form>
    </div>
  );
}
