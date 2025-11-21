package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.ClinicTimingDTO;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.service.ClinicTimingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class ClinicTimingController {

    private final ClinicTimingService service;

    @PostMapping("/saveclinictimings")
    public ResponseEntity<ApiResponse<List<ClinicTimingDTO>>> create(
            @RequestBody @Valid ClinicTimingDTO dto) {

        List<ClinicTimingDTO> created = service.createTimings(dto);
        ApiResponse<List<ClinicTimingDTO>> response =
                new ApiResponse<>(true, "Clinic timing(s) saved successfully", created);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/getAllClinicTimings")
    public ResponseEntity<ApiResponse<List<ClinicTimingDTO>>> readAll() {
        List<ClinicTimingDTO> slots = service.getAllTimings();
        ApiResponse<List<ClinicTimingDTO>> response =
                new ApiResponse<>(true, "Clinic timings fetched successfully", slots);

        return ResponseEntity.ok(response);
    }
}
