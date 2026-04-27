import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export async function Header() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-700" />
          Exameo
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isAuthed ? (
            <>
              <Link href="/me" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                Mon profil
              </Link>
              <span className="hidden text-zinc-500 sm:block">{session!.user!.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Se déconnecter
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("keycloak", { redirectTo: "/me" });
              }}
            >
              <button
                type="submit"
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
              >
                Se connecter
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
