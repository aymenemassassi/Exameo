import Link from "next/link";

const features = [
  {
    title: "Gestion complète des examens",
    body: "Banque de questions multilingue, conception, planification, passage avec timer authoritative, autosave Valkey.",
  },
  {
    title: "Identité Keycloak 26",
    body: "OIDC + MFA TOTP, SSO Google/GitHub, RBAC fine-grained sur 4 rôles (étudiant, enseignant, surveillant, admin).",
  },
  {
    title: "Anti-triche IA",
    body: "Webcam check, tab switch detection, similarity n-gram, scoring de confiance temps réel via Socket.IO.",
  },
  {
    title: "Observabilité bout-en-bout",
    body: "Prometheus + Grafana + Loki + Tempo via OpenTelemetry Collector. Dashboards prêts à l'emploi.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Sprint 0 · vitrine techno</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Exameo · plateforme moderne de gestion d'examens
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          Refonte d'une application Java EE legacy en architecture polyglotte microservices :
          Spring Boot 3.4 / Java 21, Next.js 15 RSC, FastAPI, Node Fastify, Keycloak,
          observabilité OpenTelemetry, IA pour la génération de questions et l'anti-triche.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/me"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            Accéder à mon profil
          </Link>
          <a
            href="https://github.com/aymenemassassi/Exameo"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Voir le repo GitHub
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Ce que cette vitrine démontre</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        <p>
          <strong>Démarrage rapide :</strong> <code>docker compose -f infra/docker-compose.yml up -d</code> puis{" "}
          <code>npm run dev</code> ici. Comptes seed : <code>student/student</code>, <code>teacher/teacher</code>,{" "}
          <code>proctor/proctor</code>, <code>admin/admin</code>.
        </p>
      </section>
    </div>
  );
}
