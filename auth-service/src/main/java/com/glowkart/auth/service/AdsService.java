package com.glowkart.auth.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.glowkart.auth.dto.ApiResponse;
import com.glowkart.auth.dto.DashboardAdsResponseDto;
import com.glowkart.auth.feign.AdminDashboardAdsClient;

@Service
public class AdsService {
    private final AdminDashboardAdsClient adminDashboardAdsClient;

    public AdsService(AdminDashboardAdsClient adminDashboardAdsClient) {
        this.adminDashboardAdsClient = adminDashboardAdsClient;
    }

    public List<DashboardAdsResponseDto> getAllDashboardAds() {
        ApiResponse<List<DashboardAdsResponseDto>> response = adminDashboardAdsClient.getAllAds();
        if (response.isSuccess()) {
            return response.getData();
        }
        return Collections.emptyList();
    }
}

