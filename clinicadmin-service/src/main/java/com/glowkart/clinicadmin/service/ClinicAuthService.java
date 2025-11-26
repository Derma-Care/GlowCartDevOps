package com.glowkart.clinicadmin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicLoginResponse;
import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class ClinicAuthService {

    @Autowired
    private AdminServiceFeignClient client;

    @Autowired
    private ObjectMapper objectMapper;

    // Updated to return ApiResponse<ClinicLoginResponse>
    public ApiResponse<ClinicLoginResponse> login(ClinicLoginRequest request) {
        try {
            // Call admin service via Feign and return full ApiResponse
            ApiResponse<ClinicLoginResponse> response = client.login(request);

            // Optional: check success before returning
            if (response.isSuccess()) {
                return response;
            } else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, response.getMessage());
            }

        } catch (FeignException e) {
            Map<String, Object> errorBody;
            try {
                errorBody = objectMapper.readValue(e.contentUTF8(), Map.class);
            } catch (Exception ex) {
                errorBody = Map.of("error", e.getMessage());
            }

            throw new ResponseStatusException(
                    HttpStatus.valueOf(e.status()),
                    errorBody.getOrDefault("message", errorBody.getOrDefault("error", "Login failed")).toString()
            );
        }
    }
}
