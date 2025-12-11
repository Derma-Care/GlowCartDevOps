package com.glowkart.clinicadmin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.clinicadmin.dto.*;
import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;
import feign.FeignException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ClinicAuthService {

    private final AdminServiceFeignClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    public ClinicAuthService(AdminServiceFeignClient client) {
        this.client = client;
    }

    @FunctionalInterface
    interface FeignCall<T> {
        ResponseEntity<ApiResponse<T>> execute();
    }

    /**
     * Generic handler for Feign calls.
     * Handles 2xx normally.
     * For 4xx/5xx (FeignException), attempts to parse JSON.
     * If empty body, returns fallback ApiResponse with proper message.
     */
    private <T> ResponseEntity<ApiResponse<T>> handleFeignCall(FeignCall<T> call, String fallbackMessage) {
        try {
            // Success: return normal response
            ResponseEntity<ApiResponse<T>> response = call.execute();
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (FeignException ex) {
            try {
                String json = ex.contentUTF8();

                if (json != null && !json.isEmpty()) {
                    // Deserialize JSON into ApiResponse<T>
                    ApiResponse<T> apiResponse = mapper.readValue(json, new TypeReference<ApiResponse<T>>() {});
                    return ResponseEntity.status(ex.status()).body(apiResponse);
                } else {
                    // Empty body — return fallback message
                    return ResponseEntity.status(ex.status())
                            .body(new ApiResponse<>(false, fallbackMessage, null));
                }

            } catch (Exception parseErr) {
                // Parsing failed — return fallback message
                return ResponseEntity.status(ex.status())
                        .body(new ApiResponse<>(false, fallbackMessage, null));
            }
        }
    }

    // ------------------- API METHODS -------------------

    public ResponseEntity<ApiResponse<ClinicPublicDTO>> login(ClinicLoginRequest request) {
        return handleFeignCall(() -> client.login(request), "Invalid username or password");
    }

    public ResponseEntity<ApiResponse<Void>> updatePassword(String username, ChangePasswordDTO dto) {
        return handleFeignCall(() -> client.updatePassword(username, dto), "Failed to update password");
    }

    public ResponseEntity<ApiResponse<Void>> forgotPassword(ForgotPasswordRequest req) {
        return handleFeignCall(() -> client.forgotPassword(req), "Failed to send OTP");
    }

    public ResponseEntity<ApiResponse<Void>> resetPassword(ResetPasswordRequest req) {
        return handleFeignCall(() -> client.resetPassword(req), "Failed to reset password");
    }

    public ResponseEntity<ApiResponse<Void>> resendOtp(ForgotPasswordRequest req) {
        return handleFeignCall(() -> client.resendOtp(req), "Failed to resend OTP");
    }
}
