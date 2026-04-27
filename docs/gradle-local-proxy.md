# Proxy local pour Gradle

Si vous travaillez derriere un proxy d'entreprise (par ex. McAfee Web Gateway, Zscaler, ou un proxy interne), Gradle ne pourra pas resoudre les dependances en l'etat. Vous avez deux options sans toucher au repo (les fichiers ci-dessous sont **gitignores**) :

## Option 1 (recommandee) — proxy au niveau utilisateur Gradle

Editez ou creez `~/.gradle/gradle.properties` (Linux/macOS) ou `%USERPROFILE%\.gradle\gradle.properties` (Windows) :

```properties
systemProp.https.proxyHost=proxy.votre-entreprise.lan
systemProp.https.proxyPort=3128
systemProp.http.proxyHost=proxy.votre-entreprise.lan
systemProp.http.proxyPort=3128
systemProp.https.nonProxyHosts=localhost|127.0.0.1|host.docker.internal
systemProp.http.nonProxyHosts=localhost|127.0.0.1|host.docker.internal

# Si proxy NTLM (auth via credentials Windows) :
systemProp.jdk.http.auth.tunneling.disabledSchemes=
systemProp.jdk.http.auth.proxying.disabledSchemes=
```

Avantage : valable pour **tous** les projets Gradle de la machine, pas juste Exameo.

## Option 2 — proxy au niveau du projet (non versionne)

Creez `gradle-local.properties` a la racine du projet (le fichier est dans `.gitignore`) :

```properties
systemProp.https.proxyHost=proxy.votre-entreprise.lan
systemProp.https.proxyPort=3128
# ...idem que ci-dessus
```

Et ajoutez en haut de `settings.gradle.kts` :

```kotlin
val localProps = file("gradle-local.properties")
if (localProps.exists()) {
    java.util.Properties().apply {
        load(localProps.inputStream())
    }.forEach { (k, v) -> System.setProperty(k.toString(), v.toString()) }
}
```

## Verification

```bash
./gradlew --version
./gradlew :services:user-service:compileJava
```

Si le build echoue avec `Connection refused` ou `407 Proxy Authentication Required`, double-check les valeurs.
