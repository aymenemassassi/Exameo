package com.exameo.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Exameo API Gateway. Front door pour le frontend, route vers les microservices,
 * relaie les tokens OIDC, applique du rate limiting et la circuit-breaking.
 */
@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
