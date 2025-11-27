package com.glowkart.clinicadmin.service;

import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicLoginResponse;
import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;
import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ClinicAuthService {

    private final AdminServiceFeignClient client;

    public ClinicAuthService(AdminServiceFeignClient client) {
        this.client = client;
    }

    public ResponseEntity<ApiResponse<ClinicLoginResponse>> login(ClinicLoginRequest request) {
        try {
            // Call Feign client
            ResponseEntity<ApiResponse<ClinicLoginResponse>> response = client.login(request);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (FeignException feignEx) {
            // Handle errors from the downstream service
            ApiResponse<ClinicLoginResponse> errorResponse = new ApiResponse<>(
                    false,
                    "Invalid username or password", // downstream error message
                    null
            );

            HttpStatus status = HttpStatus.resolve(feignEx.status());
            if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

            return ResponseEntity.status(status).body(errorResponse);
        } catch (Exception ex) {
            // Fallback for internal errors
            ApiResponse<ClinicLoginResponse> errorResponse = new ApiResponse<>(
                    false,
                    "Internal Server Error: " + ex.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
