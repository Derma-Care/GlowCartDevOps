package com.glowkart.auth.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.auth.dto.ApiResponse;
import com.glowkart.auth.dto.DashboardAdsResponseDto;
import com.glowkart.auth.service.AdsService;

@RestController
@RequestMapping("/api")
public class AdsController {
    private final AdsService adsService;

    public AdsController(AdsService adsService) {
        this.adsService = adsService;
    }

    @GetMapping("/login/dashboard-ads")
    public ResponseEntity<ApiResponse<List<DashboardAdsResponseDto>>> getDashboardAds() {
        List<DashboardAdsResponseDto> ads = adsService.getAllDashboardAds();
        return ResponseEntity.ok(new ApiResponse<>(true, "Ads fetched successfully", ads));
    }
}

