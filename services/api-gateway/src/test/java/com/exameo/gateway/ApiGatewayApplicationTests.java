package com.exameo.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.security.oauth2.resourceserver.jwt.issuer-uri=",
    "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:0/protocol/openid-connect/certs"
})
class ApiGatewayApplicationTests {

    @Test
    void contextLoads() {
        // Smoke test : le contexte Spring se charge correctement.
    }
}
