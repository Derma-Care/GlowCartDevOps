package com.glowkart.customer.service;

import org.springframework.beans.factory.annotation.Autowired;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    // STEP-1: Verify Registration Code
    public ApiResponse<RegistrationResponseDTO> verifyCode(String code) {

        // Load existing customer using this code
        Customer customer = customerRepository.findAll().stream()
                .filter(c -> code.equals(c.getRegistrationCode()))
                .findFirst()
                .orElse(null);

        // STEP 4: Code fully used -> do not allow verification
        if (customer != null && customer.isRegistrationCompleted()) {
            return new ApiResponse<>(
                    false,
                    "Code already used!",
                    new RegistrationResponseDTO(
                            code,
                            true,   // used
                            false,  // valid
                            true,   // registrationCodeVerified
                            customer.isUserProfileCompleted(),
                            customer.isSpinWheelCompleted(),
                            customer.isRegistrationCompleted()
                    )
            );
        }

        ApiResponse<RegistrationResponseDTO> adminResponse;
        try {
            adminResponse = adminServiceClient.verifyCode(new RegistrationRequestDTO(code));
        } catch (FeignException ex) {
            try {
                String body = ex.contentUTF8();
                return objectMapper.readValue(body, new TypeReference<ApiResponse<RegistrationResponseDTO>>() {});
            } catch (Exception e) {
                // FIXED: using full constructor
                return new ApiResponse<>(
                        false,
                        "Failed to verify code",
                        new RegistrationResponseDTO(
                                code,
                                false,  // used
                                false,  // valid
                                false,  // registrationCodeVerified
                                false,  // userProfileCompleted
                                false,  // spinWheelCompleted
                                false   // registrationCompleted
                        )
                );
            }
        }

        RegistrationResponseDTO adminData = adminResponse.getData();

        if (!adminData.isValid()) {
            return new ApiResponse<>(false, "Invalid or used code", adminData);
        }

        // If no customer exists, create new (STEP 1 BEGIN)
        if (customer == null) {
            customer = new Customer();
            customer.setRegistrationCode(code);
        }

        // Mark STEP-1 completed
        customer.setRegistrationCodeVerified(true);
        customerRepository.save(customer);

        // Return combined response
        RegistrationResponseDTO result = new RegistrationResponseDTO(
                adminData.getCode(),
                false, // used
                true,  // valid
                customer.isRegistrationCodeVerified(),
                customer.isUserProfileCompleted(),
                customer.isSpinWheelCompleted(),
                customer.isRegistrationCompleted()
        );

        return new ApiResponse<>(true, "Code verified successfully", result);
    }
}
