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

        // 2️⃣ Call admin-service (with Feign exception handling)
        ApiResponse<RegistrationResponseDTO> adminResponse;
        try {
            adminResponse = adminServiceClient.verifyCode(new RegistrationRequestDTO(code));
        } catch (FeignException e) {
            try {
                String responseBody = e.contentUTF8();
                ObjectMapper mapper = new ObjectMapper();
                adminResponse = mapper.readValue(
                        responseBody,
                        new TypeReference<ApiResponse<RegistrationResponseDTO>>() {}
                );
            } catch (Exception ex) {
                logger.error("Failed to parse admin-service verify response: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>(false, "Unable to verify code!", null));
            }
        }

        RegistrationResponseDTO adminData = adminResponse.getData();

        // Return bad request if admin data invalid
        if (adminData == null || !Boolean.TRUE.equals(adminData.getValid())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, adminResponse.getMessage(), adminData));
        }

        // 3️⃣ Create customer if first time
        if (customer == null) {
            customer = new Customer();
            customer.setRegistrationCode(code);
        }

        // 4️⃣ Mark code as verified
        customer.setRegistrationCodeVerified(true);

        // 5️⃣ Set registration rank if first time
        if (customer.getRegistrationRank() == null) {
            customer.setRegistrationRank(adminData.getRank());
        }

        // 6️⃣ Mark code used if admin says not used
        if (!Boolean.TRUE.equals(adminData.getUsed())) {
            try {
                ApiResponse<RegistrationResponseDTO> markUsedResponse =
                        adminServiceClient.markCodeUsed(new RegistrationRequestDTO(code));

                if (markUsedResponse.getData() != null) {
                    adminData.setUsed(markUsedResponse.getData().getUsed());
                }
            } catch (Exception e) {
                logger.warn("Failed to mark code as used for {}: {}", code, e.getMessage());
            }
        }

        // 7️⃣ Save customer
        customerRepository.save(customer);

        // 8️⃣ Build full step response
        RegistrationResponseDTO stepResponse = buildStepResponse(customer, code, adminData.getUsed());

        // 9️⃣ Determine if code already claimed
        boolean allStepsCompleted =
                Boolean.TRUE.equals(stepResponse.getUsed())
                && Boolean.TRUE.equals(stepResponse.getRegistrationCompleted())
                && Boolean.TRUE.equals(stepResponse.getRegistrationCodeVerified())
                && Boolean.TRUE.equals(stepResponse.getUserProfileCompleted())
                && Boolean.TRUE.equals(stepResponse.getSpinWheelCompleted());


        boolean successFlag = true;
        String message = "Code verified successfully!";
        RegistrationResponseDTO responseData = stepResponse;

        if (allStepsCompleted) {
            successFlag = false;
            message = "This code has already been claimed. Please try a different code.";

            // Minimal response: only code and used
            responseData = new RegistrationResponseDTO();
            responseData.setCode(code);
            responseData.setUsed(true);
        }

        // 🔟 Return final response
        return ResponseEntity.ok(new ApiResponse<>(successFlag, message, responseData));
    }

    // Build response flags for full response
    private RegistrationResponseDTO buildStepResponse(Customer customer, String code, Boolean used) {

        Boolean registrationCodeVerified = customer != null ? customer.isRegistrationCodeVerified() : null;
        Boolean userProfileCompleted = customer != null ? customer.isUserProfileCompleted() : null;
        Boolean spinWheelCompleted = customer != null ? customer.isSpinWheelCompleted() : null;
        Boolean registrationCompleted = customer != null ? customer.isRegistrationCompleted() : null;

        return new RegistrationResponseDTO(
                code,
                used,
                true, // valid
                customer != null ? customer.getRegistrationRank() : null,
                registrationCodeVerified,
                userProfileCompleted,
                spinWheelCompleted,
                registrationCompleted
        );
    }

    // STEP-2: Mark code as used
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> markCodeUsed(String code) {

        ApiResponse<RegistrationResponseDTO> adminResponse;
        try {
            adminResponse = adminServiceClient.markCodeUsed(new RegistrationRequestDTO(code));
        } catch (FeignException e) {
            try {
                String responseBody = e.contentUTF8();
                ObjectMapper mapper = new ObjectMapper();
                adminResponse = mapper.readValue(
                        responseBody,
                        new TypeReference<ApiResponse<RegistrationResponseDTO>>() {}
                );
            } catch (Exception ex) {
                logger.error("Failed to parse admin-service response: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>(false, "Failed to mark code as used", null));
            }
        }

        RegistrationResponseDTO adminData = adminResponse.getData();

        if (adminData == null || !Boolean.TRUE.equals(adminData.getValid())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, adminResponse.getMessage(), adminData));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, adminResponse.getMessage(), adminData));
    }
}
