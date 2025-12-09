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

        // 1️⃣ Find customer by registration code
        Customer customer = customerRepository.findByRegistrationCode(code);

        // 2️⃣ Verify code via admin-service using Feign client
        ApiResponse<RegistrationResponseDTO> adminResponse = adminServiceClient.verifyCode(new RegistrationRequestDTO(code));
        RegistrationResponseDTO adminData = adminResponse.getData();

        if (adminData == null || !adminData.isValid()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse<>(false, adminResponse.getMessage(), null)
            );
        }

        // 3️⃣ Create customer if first time
        if (customer == null) {
            customer = new Customer();
            customer.setRegistrationCode(code);
        }

        // 4️⃣ Mark code as verified locally
        customer.setRegistrationCodeVerified(true);

        // 5️⃣ Set registration rank from admin if first time
        if (customer.getRegistrationRank() == null) {
            customer.setRegistrationRank(adminData.getRank());
        }

        // 6️⃣ Mark code as used on first verification via Feign client
        if (!adminData.isUsed()) {
            try {
                ApiResponse<RegistrationResponseDTO> markUsedResponse =
                        adminServiceClient.markCodeUsed(new RegistrationRequestDTO(code));
                if (markUsedResponse.getData() != null) {
                    adminData.setUsed(markUsedResponse.getData().isUsed());
                }
            } catch (Exception e) {
                logger.warn("Failed to mark code as used for {}: {}", code, e.getMessage());
            }
        }

        // 7️⃣ Save customer locally
        customerRepository.save(customer);

        // 8️⃣ Build step flags
        RegistrationResponseDTO stepResponse = buildStepResponse(customer, code, adminData.isUsed());

        // 9️⃣ Determine success and message
        boolean successFlag = true;
        String message = "Code verified successfully!";

        // If registration is fully complete and code is already used, override message & flag
        if (stepResponse.isUsed() &&
            stepResponse.isRegistrationCompleted() &&
            stepResponse.isRegistrationCodeVerified() &&
            stepResponse.isUserProfileCompleted() &&
            stepResponse.isSpinWheelCompleted()) {
            successFlag = false;
            message = "Code already used!";
        }

        // 10️⃣ Return final response
        return ResponseEntity.ok(new ApiResponse<>(successFlag, message, stepResponse));
    }



    // Helper: Build registration step response
    private RegistrationResponseDTO buildStepResponse(Customer customer, String code, boolean used) {

        boolean registrationCodeVerified = customer != null && customer.isRegistrationCodeVerified();
        boolean userProfileCompleted = customer != null && customer.isUserProfileCompleted();
        boolean spinWheelCompleted = customer != null && customer.isSpinWheelCompleted();
        boolean registrationCompleted = customer != null && customer.isRegistrationCompleted();

        return new RegistrationResponseDTO(
                code,
                used,
                true,
                customer.getRegistrationRank(),       // 🔥 add rank
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
