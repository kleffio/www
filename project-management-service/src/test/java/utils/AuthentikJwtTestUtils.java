package utils;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

public class AuthentikJwtTestUtils {

    public static SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor mockAuthentikJwt() {
        return mockAuthentikJwt("user123", "test@example.com", "testuser");
    }

    public static SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor mockAuthentikJwt(
            String sub, String email, String username) {
        return jwt()
                .jwt(jwt -> jwt
                        .subject(sub)
                        .claim("iss", "https://your-authentik-domain.com/application/o/your-app/")
                        .claim("aud", "your-client-id")
                        .claim("email", email)
                        .claim("email_verified", true)
                        .claim("preferred_username", username)
                        .claim("name", username)
                        .claim("groups", List.of("users"))
                );
    }

    public static SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor mockAuthentikJwtWithGroups(
            String sub, String email, String username, String... groups) {
        return jwt()
                .jwt(jwt -> jwt
                        .subject(sub)
                        .claim("iss", "https://your-authentik-domain.com/application/o/your-app/")
                        .claim("aud", "your-client-id")
                        .claim("email", email)
                        .claim("email_verified", true)
                        .claim("preferred_username", username)
                        .claim("name", username)
                        .claim("groups", List.of(groups))
                )
                .authorities(Arrays.stream(groups)
                        .map(group -> new SimpleGrantedAuthority("ROLE_" + group.toUpperCase()))
                        .collect(Collectors.toList())
                );
    }

    public static SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor mockAuthentikAdmin() {
        return mockAuthentikJwtWithGroups(
                "admin123",
                "admin@example.com",
                "admin",
                "admins", "users"
        );
    }
}