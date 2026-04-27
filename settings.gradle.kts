// =============================================================================
// Exameo - Gradle multi-projects (Java backend services + future modules)
// =============================================================================

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

rootProject.name = "exameo"

include(
    ":services:api-gateway",
    ":services:user-service"
)
