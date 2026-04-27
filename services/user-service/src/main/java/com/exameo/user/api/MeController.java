package com.exameo.user.api;

import com.exameo.user.domain.UserProfile;
import com.exameo.user.domain.UserProfileRepository;
import com.exameo.user.domain.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Endpoint /me. Retourne le profil de l'utilisateur authentifié, en le créant
 * paresseusement à partir des claims OIDC s'il n'existe pas encore en base.
 */
@RestController
@RequestMapping("/me")
@Tag(name = "Me", description = "Profil de l'utilisateur authentifié.")
@SecurityRequirement(name = "bearer-jwt")
public class MeController {

    private final UserProfileRepository repository;

    public MeController(UserProfileRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(summary = "Profil de l'utilisateur courant", description = "Retourne ou provisionne le profil local à partir du JWT Keycloak.")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal Jwt jwt) {
        UserProfile profile = repository.findByKeycloakId(jwt.getSubject())
            .orElseGet(() -> repository.save(provisionFromJwt(jwt)));

        return ResponseEntity.ok(new MeResponse(
            profile.getId().toString(),
            profile.getKeycloakId(),
            profile.getUsername(),
            profile.getEmail(),
            profile.getFirstName(),
            profile.getLastName(),
            profile.getPrimaryRole().name().toLowerCase(),
            extractRealmRoles(jwt),
            profile.getLocale()
        ));
    }

    private UserProfile provisionFromJwt(Jwt jwt) {
        Set<String> roles = extractRealmRoles(jwt);
        UserRole primary = roles.contains("admin") ? UserRole.ADMIN
            : roles.contains("teacher") ? UserRole.TEACHER
            : roles.contains("proctor") ? UserRole.PROCTOR
            : UserRole.STUDENT;

        UserProfile profile = new UserProfile(
            jwt.getSubject(),
            jwt.getClaimAsString("preferred_username"),
            jwt.getClaimAsString("email"),
            primary
        );
        profile.setFirstName(jwt.getClaimAsString("given_name"));
        profile.setLastName(jwt.getClaimAsString("family_name"));
        String locale = jwt.getClaimAsString("locale");
        if (locale != null && !locale.isBlank()) {
            profile.setLocale(locale);
        }
        return profile;
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess == null) {
            return Set.of();
        }
        Object roles = realmAccess.get("roles");
        if (!(roles instanceof List<?> list)) {
            return Set.of();
        }
        return Set.copyOf((List<String>) list);
    }

    /** DTO de réponse /me. */
    public record MeResponse(
        String id,
        String keycloakId,
        String username,
        String email,
        String firstName,
        String lastName,
        String primaryRole,
        Set<String> roles,
        String locale
    ) {}
}
