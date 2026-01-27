package com.glowkart.auth.feign;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.glowkart.auth.dto.ApiResponse;
import com.glowkart.auth.dto.DashboardAdsResponseDto;

import java.util.List;

@FeignClient(name = "admin-service", contextId = "dashboardAdsClient")

public interface AdminDashboardAdsClient {

    @GetMapping("/admin/dashboard-ads")
    ApiResponse<List<DashboardAdsResponseDto>> getAllAds();
}
