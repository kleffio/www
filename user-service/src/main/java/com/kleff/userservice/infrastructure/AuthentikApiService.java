package com.kleff.userservice.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AuthentikApiService {

    @Value("${authentik.api.url:https://auth.kleff.io}")
    private String authentikUrl;

    @Value("${authentik.api.token}")
    private String apiToken;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthentikApiService() {
        this.restTemplate = new RestTemplate();
        this.restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    private Integer getUserPk(String username) {
        try {
            String url = authentikUrl + "/api/v3/core/users/?username=" + username;
            System.out.println("Searching Authentik for user: " + username);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            System.out.println("Authentik response: " + response.getStatusCode());

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode results = root.get("results");
            
            if (results != null && results.isArray() && results.size() > 0) {
                int pk = results.get(0).get("pk").asInt();
                System.out.println("Found user PK: " + pk);
                return pk;
            }
            
            System.err.println("User not found in Authentik: " + username);
            return null;
        } catch (Exception e) {
            System.err.println("Failed to get user from Authentik: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public void updateUserName(String currentUsername, String newUsername) {
        Integer pk = getUserPk(currentUsername);
        if (pk == null) {
            System.err.println("Cannot sync - user not found: " + currentUsername);
            return;
        }

        String url = authentikUrl + "/api/v3/core/users/" + pk + "/";
        System.out.println("Updating Authentik username to: " + newUsername);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiToken);
        headers.set("Content-Type", "application/json");

        String requestBody = String.format("{\"username\": \"%s\"}", newUsername);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
            System.out.println("✅ Successfully updated username in Authentik!");
        } catch (Exception e) {
            System.err.println("❌ Failed to update username: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void updateUserEmail(String username, String email) {
        Integer pk = getUserPk(username);
        if (pk == null) {
            System.err.println("Cannot sync email - user not found: " + username);
            return;
        }

        String url = authentikUrl + "/api/v3/core/users/" + pk + "/";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiToken);
        headers.set("Content-Type", "application/json");

        String requestBody = String.format("{\"email\": \"%s\"}", email);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
            System.out.println("✅ Successfully updated email in Authentik!");
        } catch (Exception e) {
            System.err.println("❌ Failed to update email: " + e.getMessage());
        }
    }
}
