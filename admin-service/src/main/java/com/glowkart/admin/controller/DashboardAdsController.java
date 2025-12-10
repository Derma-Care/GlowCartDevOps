package com.glowkart.admin.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<DashboardAdsResponseDto> upload(@RequestBody DashboardAdsFileRequestDto dto) {
        DashboardAdsResponseDto response = dashboardAdsService.uploadFile(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard-ads")
    public ResponseEntity<List<DashboardAdsResponseDto>> getAll() {
        List<DashboardAdsResponseDto> ads = dashboardAdsService.getAllAds();
        return ResponseEntity.ok(ads);
    }

    @GetMapping("/dashboard-ads/{id}")
    public ResponseEntity<DashboardAdsResponseDto> getById(@PathVariable String id) {
        DashboardAdsResponseDto ad = dashboardAdsService.getAdById(id);
        return ResponseEntity.ok(ad);
    }

    @PutMapping("/dashboard-ads/{id}")
    public ResponseEntity<DashboardAdsResponseDto> update(@PathVariable String id,
                                                          @RequestBody DashboardAdsFileRequestDto dto) {
        DashboardAdsResponseDto updatedAd = dashboardAdsService.updateAd(id, dto);
        return ResponseEntity.ok(updatedAd);
    }

    @DeleteMapping("/dashboard-ads/{id}")
    public ResponseEntity<String> delete(@PathVariable String id) {
        dashboardAdsService.deleteAd(id);
        return ResponseEntity.ok("Ad deleted successfully");
    }
}

