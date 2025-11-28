package com.glowkart.clinicadmin.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicInfoDTO;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;

import feign.FeignException;

@Service
public class ClinicAuthService {

    private final AdminServiceFeignClient client;

    public ClinicAuthService(AdminServiceFeignClient client) {
        this.client = client;
    }

    public ResponseEntity<ApiResponse<ClinicInfoDTO>> login(ClinicLoginRequest request) {
        try {
            ResponseEntity<ApiResponse<ClinicInfoDTO>> response = client.login(request);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (FeignException feignEx) {

            ApiResponse<ClinicInfoDTO> errorResponse = new ApiResponse<>(
                    false,
                    "Invalid username or password",
                    null
            );

            HttpStatus status = HttpStatus.resolve(feignEx.status());
            if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

            return ResponseEntity.status(status).body(errorResponse);

        } catch (Exception ex) {

            ApiResponse<ClinicInfoDTO> errorResponse = new ApiResponse<>(
                    false,
                    "Internal Server Error: " + ex.getMessage(),
                    null
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}
