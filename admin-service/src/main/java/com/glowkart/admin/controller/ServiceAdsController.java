package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ServiceAdsFileRequestDto;
import com.glowkart.admin.dto.ServiceAdsResponseDto;
import com.glowkart.admin.service.ServiceAdsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class ServiceAdsController {

    private final ServiceAdsService serviceAdsService;

    @PostMapping("/service-ads/upload-file-json")
    public ResponseEntity<ApiResponse<ServiceAdsResponseDto>> upload(@RequestBody ServiceAdsFileRequestDto dto) {
        ServiceAdsResponseDto response = serviceAdsService.uploadFile(dto);
        ApiResponse<ServiceAdsResponseDto> apiResponse = new ApiResponse<>(true, "File uploaded successfully", response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/service-ads")
    public ResponseEntity<ApiResponse<List<ServiceAdsResponseDto>>> getAll() {
        List<ServiceAdsResponseDto> ads = serviceAdsService.getAllAds();
        ApiResponse<List<ServiceAdsResponseDto>> apiResponse = new ApiResponse<>(true, "All ads fetched successfully", ads);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/service-ads/{id}")
    public ResponseEntity<ApiResponse<ServiceAdsResponseDto>> getById(@PathVariable String id) {
        ServiceAdsResponseDto ad = serviceAdsService.getAdById(id);
        ApiResponse<ServiceAdsResponseDto> apiResponse = new ApiResponse<>(true, "Ad fetched successfully", ad);
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/service-ads/{id}")
    public ResponseEntity<ApiResponse<ServiceAdsResponseDto>> update(@PathVariable String id,
                                                                     @RequestBody ServiceAdsFileRequestDto dto) {
        ServiceAdsResponseDto updatedAd = serviceAdsService.updateAd(id, dto);
        ApiResponse<ServiceAdsResponseDto> apiResponse = new ApiResponse<>(true, "Ad updated successfully", updatedAd);
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/service-ads/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        serviceAdsService.deleteAd(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>(true, "Ad deleted successfully", null);
        return ResponseEntity.ok(apiResponse);
    }
}
