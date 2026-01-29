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

        Map<?, ?> response = restTemplate.getForObject(url, Map.class);
        if (response == null) return null;

        Object addressObj = response.get("address");
        if (!(addressObj instanceof Map<?, ?> addressMap)) {
            return null;
        }

        Object stateObj = addressMap.get("state");
        return stateObj != null ? stateObj.toString() : null;
    }
}
