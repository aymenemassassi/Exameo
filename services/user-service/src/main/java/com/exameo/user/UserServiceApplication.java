package com.exameo.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Exameo User Service. Profils utilisateur, cohortes, filières. Source de vérité
 * pour les attributs locaux ; l'identité reste gérée par Keycloak.
 */
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
