package com.glowkart.customer.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.RegistrationRequestDTO;
import com.glowkart.customer.dto.RegistrationResponseDTO;
import com.glowkart.customer.feign.AdminServiceClient;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.repo.CustomerRepository;

import feign.FeignException;

@Service
public class RegistrationService {

    @Autowired
    private AdminServiceClient adminServiceClient;

    @Autowired
    private CustomerRepository customerRepository;

    private static final Logger logger = LoggerFactory.getLogger(RegistrationService.class);

    // STEP-1: Verify Registration Code
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> verifyCode(String code) {

        Customer customer = customerRepository.findByRegistrationCode(code);

        // Already completed locally
        if (customer != null && customer.isRegistrationCompleted()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse<>(
                            false,
                            "Code already used!",
                            buildStepResponse(customer, code, true)
                    )
            );
        }

        ApiResponse<RegistrationResponseDTO> adminResponse = null;
        try {
            adminResponse = adminServiceClient.verifyCode(new RegistrationRequestDTO(code));
        } catch (FeignException e) {
            // Extract admin-service response body
            try {
                String responseBody = e.contentUTF8();
                ObjectMapper mapper = new ObjectMapper();
                adminResponse = mapper.readValue(
                        responseBody, new TypeReference<ApiResponse<RegistrationResponseDTO>>() {});
            } catch (Exception ex) {
                logger.error("Failed to parse admin-service response: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        new ApiResponse<>(
                                false,
                                "Failed to verify code",
                                buildStepResponse(customer, code, false)
                        )
                );
            }
        }

        RegistrationResponseDTO adminData = adminResponse.getData();

        // Invalid code from admin-service
        if (adminData == null || !adminData.isValid()) {
            boolean used = adminData != null && adminData.isUsed(); // use real admin-service value
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse<>(
                            false,
                            adminResponse.getMessage(),
                            buildStepResponse(customer, code, used)
                    )
            );
        }

        // Create customer locally if not exists
        if (customer == null) {
            customer = new Customer();
            customer.setRegistrationCode(code);
        }

        // Mark local registration step
        customer.setRegistrationCodeVerified(true);
        customerRepository.save(customer);

        // Return enriched response with admin message
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        adminResponse.getMessage(),
                        buildStepResponse(customer, code, adminData.isUsed())
                )
        );
    }

    // Helper: Build registration step response
    private RegistrationResponseDTO buildStepResponse(Customer customer, String code, boolean used) {
        boolean registrationCodeVerified = customer != null && customer.isRegistrationCodeVerified();
        boolean userProfileCompleted = customer != null && customer.isUserProfileCompleted();
        boolean spinWheelCompleted = customer != null && customer.isSpinWheelCompleted();
        boolean registrationCompleted = customer != null && customer.isRegistrationCompleted();

        return new RegistrationResponseDTO(
                code,
                used || registrationCompleted,
                registrationCodeVerified || userProfileCompleted || spinWheelCompleted,
                registrationCodeVerified,
                userProfileCompleted,
                spinWheelCompleted,
                registrationCompleted
        );
    }

    // STEP-2: Mark code as used in admin-service
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> markCodeUsed(String code) {
        ApiResponse<RegistrationResponseDTO> adminResponse = null;

        try {
            adminResponse = adminServiceClient.markCodeUsed(new RegistrationRequestDTO(code));
        } catch (FeignException e) {
            // Extract admin-service response
            try {
                String responseBody = e.contentUTF8();
                ObjectMapper mapper = new ObjectMapper();
                adminResponse = mapper.readValue(
                        responseBody, new TypeReference<ApiResponse<RegistrationResponseDTO>>() {});
            } catch (Exception ex) {
                logger.error("Failed to parse admin-service response: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                        new ApiResponse<>(false, "Failed to mark code as used", null)
                );
            }
        }

        RegistrationResponseDTO adminData = adminResponse.getData();

        if (adminData == null || !adminData.isValid()) {
            boolean used = adminData != null && adminData.isUsed();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse<>(false, adminResponse.getMessage(), adminData)
            );
        }

        // Optionally, update local customer state if needed

        return ResponseEntity.ok(new ApiResponse<>(true, adminResponse.getMessage(), adminData));
    }
}
