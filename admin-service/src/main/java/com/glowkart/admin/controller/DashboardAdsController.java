package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.DashboardAdsFileRequestDto;
import com.glowkart.admin.dto.DashboardAdsResponseDto;
import com.glowkart.admin.service.DashboardAdsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class DashboardAdsController {

    private final DashboardAdsService dashboardAdsService;

    @PostMapping("/dashboard-ads/upload-file-json")
    public ResponseEntity<ApiResponse<DashboardAdsResponseDto>> upload(@RequestBody DashboardAdsFileRequestDto dto) {
        DashboardAdsResponseDto response = dashboardAdsService.uploadFile(dto);
        ApiResponse<DashboardAdsResponseDto> apiResponse = new ApiResponse<>(true, "File uploaded successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/dashboard-ads")
    public ResponseEntity<ApiResponse<List<DashboardAdsResponseDto>>> getAll() {
        List<DashboardAdsResponseDto> ads = dashboardAdsService.getAllAds();
        ApiResponse<List<DashboardAdsResponseDto>> apiResponse = new ApiResponse<>(true, "All ads fetched successfully", ads);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/dashboard-ads/{id}")
    public ResponseEntity<ApiResponse<DashboardAdsResponseDto>> getById(@PathVariable String id) {
        DashboardAdsResponseDto ad = dashboardAdsService.getAdById(id);
        ApiResponse<DashboardAdsResponseDto> apiResponse = new ApiResponse<>(true, "Ad fetched successfully", ad);
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/dashboard-ads/{id}")
    public ResponseEntity<ApiResponse<DashboardAdsResponseDto>> update(@PathVariable String id,
                                                                       @RequestBody DashboardAdsFileRequestDto dto) {
        DashboardAdsResponseDto updatedAd = dashboardAdsService.updateAd(id, dto);
        ApiResponse<DashboardAdsResponseDto> apiResponse = new ApiResponse<>(true, "Ad updated successfully", updatedAd);
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/dashboard-ads/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        dashboardAdsService.deleteAd(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>(true, "Ad deleted successfully", null);
        return ResponseEntity.ok(apiResponse);
    }
}
