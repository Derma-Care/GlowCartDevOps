package com.glowkart.customer.geo;

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

        Map<String, Object> address =
                (Map<String, Object>) response.get("address");

        return (String) address.get("state");
    }
}
