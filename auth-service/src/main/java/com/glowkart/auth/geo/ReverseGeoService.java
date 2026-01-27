package com.glowkart.auth.geo;

public interface ReverseGeoService {
    String resolveState(double latitude, double longitude);
}
