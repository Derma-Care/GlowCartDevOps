package com.glowkart.customer.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.dto.WheelSliceDto;
import com.glowkart.customer.exception.CustomerNotFoundException;
import com.glowkart.customer.exception.DuplicateAadhaarException;
import com.glowkart.customer.exception.DuplicateMobileException;
import com.glowkart.customer.exception.InvalidInputException;
import com.glowkart.customer.feign.WheelSliceClient;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.repo.CustomerRepository;
import com.glowkart.customer.util.AadhaarUtils;

@Service
public class CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private WheelSliceClient wheelSliceClient;

    @Autowired
    private RegistrationService registrationService;

    // ==================== STEP 1: Save Customer ====================
    @Transactional
    public ApiResponse<Customer> saveCustomer(CustomerDetailsDTO dto) {
        // Find customer by registration code
        Customer customer = customerRepository.findByRegistrationCode(dto.getRegistrationCode());
        if (customer == null) {
            log.warn("Invalid registration code: {}", dto.getRegistrationCode());
            throw new CustomerNotFoundException("Invalid user session");
        }

        // Check if registration code is verified
        if (!customer.isRegistrationCodeVerified()) {
            return new ApiResponse<>(false, "Verify registration code first", customer);
        }

        // Duplicate checks
        checkDuplicateMobile(dto.getMobile(), customer.getMobile());
        checkDuplicateAadhar(dto.getAadharNumber(), customer.getMobile());

        // Step 1: Field validation
        List<String> missingFields = validateStep1Fields(dto);
        if (!missingFields.isEmpty()) {
            return new ApiResponse<>(false,
                    "Missing required fields: " + String.join(", ", missingFields), null);
        }

        // Step 2: Copy fields to Customer entity
        copyStep1Fields(dto, customer);
        customer.setUserProfileCompleted(true);
        customerRepository.save(customer);

        log.info("Step-1 completed for mobile: {}", customer.getMobile());
        return new ApiResponse<>(true, "Step-1 completed. Please proceed to the next step.", customer);
    }

    // ==================== STEP 2: Spin Wheel ====================
    @Transactional
    public ApiResponse<Customer> completeSpinByMobile(String mobile, SpinWheelDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));

        if (!customer.isUserProfileCompleted())
            return new ApiResponse<>(false, "Complete Profile first!", customer);

        WheelSliceDto slice = wheelSliceClient.getSliceById(dto.getRewardId());
        if (slice != null) {
            customer.setSpinRewardId(slice.getId());
            customer.setSpinRewardValue(slice.getOption());
            customer.setSpinRewardImage(slice.getSrc());
        }

        customer.setSpinWheelCompleted(true);
        customerRepository.save(customer);

        log.info("Step-2 (Spin Wheel) completed for mobile: {}", mobile);
        return new ApiResponse<>(true, "Step-2 completed. Please proceed to the next step.", customer);
    }

    // ==================== STEP 3: Complete Registration ====================
    @Transactional
    public ApiResponse<Customer> completeRegistrationByMobile(String mobile, CompleteRegistrationDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));

        if (!customer.isSpinWheelCompleted())
            return new ApiResponse<>(false, "Complete Spin Wheel first!", customer);

        customer.setPrizePostScreenshot(dto.getPrizePostScreenshot());
        customer.setFollowScreenshot(dto.getFollowScreenshot());
        customer.setAddress(dto.getAddress());
        customer.setRegistrationCompleted(true);

        customerRepository.save(customer);

        try {
            registrationService.markCodeUsed(customer.getRegistrationCode());
        } catch (Exception e) {
            log.error("Failed to mark code as used for registrationCode {}: {}",
                      customer.getRegistrationCode(), e.getMessage());
        }

        log.info("Registration completed for mobile: {}", mobile);
        return new ApiResponse<>(true, "Registration completed successfully!", customer);
    }

    // ==================== Wheel Slices ====================
    public ApiResponse<List<WheelSliceDto>> getWheelSlices() {
        List<WheelSliceDto> slices = wheelSliceClient.getAllSlices();
        return new ApiResponse<>(true, "Wheel slices fetched", slices);
    }

    // ==================== CRUD ====================
    public ApiResponse<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) return new ApiResponse<>(false, "No customers found", null);
        return new ApiResponse<>(true, "Customers retrieved successfully", customers);
    }

    public ApiResponse<Customer> getCustomer(String mobile) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));
        return new ApiResponse<>(true, "Customer retrieved successfully", customer);
    }

    public ApiResponse<Customer> getCustomerByRegistrationCode(String code) {
        Customer customer = customerRepository.findByRegistrationCode(code);
        if (customer == null) throw new CustomerNotFoundException("Customer not found for this code");
        return new ApiResponse<>(true, "Customer retrieved successfully", customer);
    }

    public ApiResponse<String> deleteCustomer(String mobile) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));
        customerRepository.delete(customer);
        log.info("Customer deleted: {}", mobile);
        return new ApiResponse<>(true, "Customer deleted successfully", mobile);
    }

    // ==================== VALIDATION ====================
    private List<String> validateStep1Fields(CustomerDetailsDTO dto) {
        List<String> missingFields = new ArrayList<>();

        if (isEmpty(dto.getGender())) missingFields.add("gender");

        if (dto.getServiceStatus() == 1) {
            if (isEmpty(dto.getClinicName())) missingFields.add("clinicName");
            if (isEmpty(dto.getClinicCityArea())) missingFields.add("clinicCityArea");
            if (dto.getDateOfLastVisit() == null) missingFields.add("dateOfLastVisit");
            if (isEmpty(dto.getServiceType())) missingFields.add("serviceType");
            if (isEmpty(dto.getPrescription())) missingFields.add("prescription");
        } else if (dto.getServiceStatus() == 2) {
            if (isEmpty(dto.getCategory())) missingFields.add("category");
            if (isEmpty(dto.getConcern())) missingFields.add("concern");
            if (isEmpty(dto.getSkinTone())) missingFields.add("skinTone");
        } else {
            throw new InvalidInputException("Invalid serviceStatus value");
        }

        return missingFields;
    }

    private boolean isEmpty(Object value) {
        if (value == null) return true;
        if (value instanceof String) return ((String) value).trim().isEmpty();
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            return list.isEmpty() || list.stream().allMatch(
                    item -> item == null || (item instanceof String && ((String) item).trim().isEmpty())
            );
        }
        return false;
    }

    // ==================== COPY FIELDS ====================
    private void copyStep1Fields(CustomerDetailsDTO dto, Customer customer) {
        customer.setFullName(dto.getFullName());
        customer.setMobile(dto.getMobile());
        customer.setEmail(dto.getEmail());
        customer.setCity(dto.getCity());
        customer.setDob(dto.getDob());
        customer.setBlood(dto.getBlood());
        customer.setRegistrationCode(dto.getRegistrationCode());
        customer.setReferBy(dto.getReferBy());
        customer.setServiceStatus(dto.getServiceStatus());
        customer.setAadhaarConsent(dto.getAadhaarConsent());
        customer.setGender(dto.getGender());

        if (dto.getServiceStatus() == 1) {
            customer.setClinicName(dto.getClinicName());
            customer.setClinicCityArea(dto.getClinicCityArea());
            customer.setDateOfLastVisit(dto.getDateOfLastVisit());
            customer.setServiceType(dto.getServiceType());
            customer.setPrescription(dto.getPrescription());
        } else if (dto.getServiceStatus() == 2) {
            customer.setCategory(dto.getCategory());
            customer.setConcern(dto.getConcern());
            customer.setSkinTone(dto.getSkinTone());
            customer.setPhoto(dto.getPhoto());
        }

        // Aadhaar handling
        if (dto.getAadharNumber() != null && !dto.getAadharNumber().isBlank()) {
            String salt = AadhaarUtils.generateSalt();
            String hash = AadhaarUtils.hashAadhaar(dto.getAadharNumber(), salt);
            String preHash = AadhaarUtils.preHashAadhaar(dto.getAadharNumber());
            String last4 = AadhaarUtils.getLast4Digits(dto.getAadharNumber());

            customer.setAadharSalt(salt);
            customer.setAadharHash(hash);
            customer.setAadharPreHash(preHash);
            customer.setAadharLast4(last4);
        } else {
            customer.setAadharPreHash(AadhaarUtils.randomPreHash());
        }
    }

    // ==================== DUPLICATE CHECKS ====================
    private void checkDuplicateMobile(String mobile, String excludeMobile) {
        customerRepository.findByMobile(mobile)
                .filter(c -> !Objects.equals(c.getMobile(), excludeMobile))
                .ifPresent(c -> {
                    log.warn("Duplicate mobile detected: {}", mobile);
                    throw new DuplicateMobileException("Mobile number already exists");
                });
    }

    private void checkDuplicateAadhar(String aadhaar, String excludeMobile) {
        if (aadhaar == null || aadhaar.isBlank()) return;

        String preHash = AadhaarUtils.preHashAadhaar(aadhaar);
        String legacyPreHash = AadhaarUtils.legacyPreHash(AadhaarUtils.getLast4Digits(aadhaar));

        List<Customer> candidates = customerRepository.findByAadharPreHashIn(List.of(preHash, legacyPreHash));

        for (Customer c : candidates) {
            if (Objects.equals(c.getMobile(), excludeMobile)) continue;

            if (c.getAadharHash() != null && c.getAadharSalt() != null) {
                String computedHash = AadhaarUtils.hashAadhaar(aadhaar, c.getAadharSalt());
                if (AadhaarUtils.constantTimeEquals(computedHash, c.getAadharHash())) {
                    log.warn("Duplicate Aadhaar detected: customerMobile={} conflictsWithMobile={}", excludeMobile, c.getMobile());
                    throw new DuplicateAadhaarException("Aadhaar number already exists");
                }
            } else {
                if (c.getAadharPreHash().equals(legacyPreHash)) {
                    log.warn("Duplicate Aadhaar (legacy user) detected: customerMobile={} conflictsWithMobile={}", excludeMobile, c.getMobile());
                    throw new DuplicateAadhaarException("Aadhaar number already exists (legacy user)");
                }
            }
        }
    }
}
