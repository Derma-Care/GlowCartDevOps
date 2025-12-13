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
     */
    private <T> ResponseEntity<ApiResponse<T>> handleFeignCall(
            FeignCall<T> call,
            String fallbackMessage
    ) {
        try {
            ResponseEntity<ApiResponse<T>> response = call.execute();

            Integer statusCode = null;
            if (response.getBody() != null && response.getBody().getStatusCode() != null) {
                statusCode = response.getBody().getStatusCode();
            }

            return ResponseEntity
                    .status(statusCode != null ? statusCode : response.getStatusCodeValue())
                    .body(response.getBody());

        } catch (FeignException ex) {
            try {
                String json = ex.contentUTF8();

                if (json != null && !json.isEmpty()) {
                    ApiResponse<T> apiResponse =
                            mapper.readValue(json, new TypeReference<ApiResponse<T>>() {});
                    return ResponseEntity.status(ex.status()).body(apiResponse);
                }

                return ResponseEntity.status(ex.status())
                        .body(new ApiResponse<>(false, fallbackMessage, null, ex.status()));

            } catch (Exception e) {
                return ResponseEntity.status(ex.status())
                        .body(new ApiResponse<>(false, fallbackMessage, null, ex.status()));
            }
        }
    }

    // ------------------- CLINIC AUTH APIs -------------------

    public ResponseEntity<ApiResponse<ClinicPublicDTO>> login(ClinicLoginRequest request) {
        return handleFeignCall(
                () -> client.login(request),
                "Invalid username or password"
        );
    }

    public ResponseEntity<ApiResponse<Void>> updatePassword(
            String username,
            ChangePasswordDTO dto
    ) {
        return handleFeignCall(
                () -> client.updatePassword(username, dto),
                "Failed to update password"
        );
    }

    public ResponseEntity<ApiResponse<Void>> forgotPassword(ForgotPasswordRequest req) {
        return handleFeignCall(
                () -> client.forgotPassword(req),
                "Failed to send OTP"
        );
    }

    public ResponseEntity<ApiResponse<Void>> resetPassword(ResetPasswordRequest req) {
        return handleFeignCall(
                () -> client.resetPassword(req),
                "Failed to reset password"
        );
    }

    public ResponseEntity<ApiResponse<Void>> resendOtp(ForgotPasswordRequest req) {
        return handleFeignCall(
                () -> client.resendOtp(req),
                "Failed to resend OTP"
        );
    }

    // ------------------- PAYOUT AUTH APIs (NEW) -------------------

    public ResponseEntity<ApiResponse<Void>> payoutLogin(PayoutLoginRequest request) {
        return handleFeignCall(
                () -> client.payoutLogin(request),
                "Invalid payout username or password"
        );
    }

    public ResponseEntity<ApiResponse<Void>> changePayoutPassword(
            String payoutUsername,
            ChangePayoutPasswordDTO dto
    ) {
        return handleFeignCall(
                () -> client.changePayoutPassword(payoutUsername, dto),
                "Failed to update payout password"
        );
    }

    public ResponseEntity<ApiResponse<Void>> payoutForgotPassword(
            ForgotPasswordRequest request
    ) {
        return handleFeignCall(
                () -> client.payoutForgotPassword(request),
                "Failed to send payout OTP"
        );
    }

    public ResponseEntity<ApiResponse<Void>> payoutResetPassword(
            ResetPasswordRequest request
    ) {
        return handleFeignCall(
                () -> client.payoutResetPassword(request),
                "Failed to reset payout password"
        );
    }

    public ResponseEntity<ApiResponse<Void>> payoutResendOtp(
            ForgotPasswordRequest request
    ) {
        return handleFeignCall(
                () -> client.payoutResendOtp(request),
                "Failed to resend payout OTP"
        );
    }
}
