package com.glowkart.customer.feign;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.DashboardAdsResponseDto;

import java.util.List;

@FeignClient(name = "admin-service", contextId = "dashboardAdsClient")

public interface AdminDashboardAdsClient {

    @GetMapping("/admin/dashboard-ads")
    ApiResponse<List<DashboardAdsResponseDto>> getAllAds();
}
