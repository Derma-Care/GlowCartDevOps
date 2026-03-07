package com.glowkart.admin.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ReverseGeoServiceImpl implements ReverseGeoService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String resolveState(double latitude, double longitude) {

        String url =
                "https://nominatim.openstreetmap.org/reverse" +
                "?lat=" + latitude +
                "&lon=" + longitude +
                "&format=json&addressdetails=1";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "GlowKart-Clinic-Service");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> body = response.getBody();

        if (body == null || body.get("address") == null) {
            throw new RuntimeException("Unable to fetch state from coordinates");
        }

        Map<String, Object> address =
                (Map<String, Object>) body.get("address");

        return (String) address.get("state");
    }
}