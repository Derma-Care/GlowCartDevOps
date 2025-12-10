package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicAdsFileRequestDto;
import com.glowkart.admin.dto.ClinicAdsResponseDto;
import com.glowkart.admin.service.ClinicAdsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class ClinicAdsController {

    private final ClinicAdsService clinicAdsService;

    @PostMapping("/clinic-ads/upload-file-json")
    public ResponseEntity<ApiResponse<ClinicAdsResponseDto>> upload(@RequestBody ClinicAdsFileRequestDto dto) {
        ClinicAdsResponseDto response = clinicAdsService.uploadFile(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "File uploaded successfully", response));
    }

    @GetMapping("/clinic-ads")
    public ResponseEntity<ApiResponse<List<ClinicAdsResponseDto>>> getAll() {
        List<ClinicAdsResponseDto> ads = clinicAdsService.getAllAds();
        return ResponseEntity.ok(new ApiResponse<>(true, "All ads fetched successfully", ads));
    }

    @GetMapping("/clinic-ads/{id}")
    public ResponseEntity<ApiResponse<ClinicAdsResponseDto>> getById(@PathVariable String id) {
        ClinicAdsResponseDto ad = clinicAdsService.getAdById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ad fetched successfully", ad));
    }

    @PutMapping("/clinic-ads/{id}")
    public ResponseEntity<ApiResponse<ClinicAdsResponseDto>> update(@PathVariable String id,
                                                                    @RequestBody ClinicAdsFileRequestDto dto) {
        ClinicAdsResponseDto updatedAd = clinicAdsService.updateAd(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ad updated successfully", updatedAd));
    }

    @DeleteMapping("/clinic-ads/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        clinicAdsService.deleteAd(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ad deleted successfully", null));
    }
}
