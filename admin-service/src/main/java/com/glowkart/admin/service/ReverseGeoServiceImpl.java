package com.glowkart.admin.service;

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

        Map<String, Object> response =
                restTemplate.getForObject(url, Map.class);

        if (response == null || response.get("address") == null) {
            throw new RuntimeException("Unable to fetch state from coordinates");
        }

        Map<String, Object> address =
                (Map<String, Object>) response.get("address");

        return (String) address.get("state");
    }
}
