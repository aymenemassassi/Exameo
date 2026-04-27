package com.exameo.user;

import com.exameo.user.domain.UserProfile;
import com.exameo.user.domain.UserProfileRepository;
import com.exameo.user.domain.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test d'intégration JPA avec un Postgres jetable (Testcontainers).
 * Vérifie le contrat repository.findByKeycloakId.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserProfileRepositoryIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine")
        .withDatabaseName("users")
        .withUsername("exameo")
        .withPassword("exameo");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    UserProfileRepository repository;

    @Test
    void shouldPersistAndFindByKeycloakId() {
        UserProfile saved = repository.save(new UserProfile(
            "kc-123", "alice", "alice@exameo.local", UserRole.STUDENT
        ));

        Optional<UserProfile> found = repository.findByKeycloakId("kc-123");
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("alice@exameo.local");
        assertThat(found.get().getPrimaryRole()).isEqualTo(UserRole.STUDENT);
        assertThat(found.get().getId()).isEqualTo(saved.getId());
    }
}
