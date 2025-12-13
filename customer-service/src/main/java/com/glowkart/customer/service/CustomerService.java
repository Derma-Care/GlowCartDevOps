package com.glowkart.customer.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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

        // Check if city exists, log or handle if new
        if (!cityExists(dto.getCity())) {
            log.info("New city '{}' detected, will be stored with this customer.", dto.getCity());
            // No special action needed since city is stored per customer
        } else {
            log.info("City '{}' already exists.", dto.getCity());
        }
        
        // Step 2: Copy fields to Customer entity
        copyStep1Fields(dto, customer);
        customer.setUserProfileCompleted(true);
        customerRepository.save(customer);

        log.info("Step-1 completed for mobile: {}", customer.getMobile());
        return new ApiResponse<>(true, "Step-1 completed. Please proceed to the next step.", customer);
    }

    // New method to get distinct cities (case-insensitive, trimmed, sorted)
    public List<String> getDistinctCities() {
        return customerRepository.findAll().stream()
            .map(Customer::getCity)
            .filter(city -> city != null && !city.trim().isEmpty())
            .map(String::trim)
            .map(String::toLowerCase)
            .distinct()
            .sorted()
            .map(city -> Character.toUpperCase(city.charAt(0)) + city.substring(1)) // Capitalize first letter
            .collect(Collectors.toList());
    }

    // Check if city exists (case-insensitive)
    public boolean cityExists(String city) {
        if (city == null || city.isBlank()) return false;
        String normalized = city.trim().toLowerCase();
        return getDistinctCities().stream()
                .map(String::toLowerCase)
                .anyMatch(c -> c.equals(normalized));
    }
 // ==================== STEP 2: Spin Wheel ====================

    @Transactional
    public ApiResponse<Customer> completeSpinByMobile(String mobile, SpinWheelDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));

        if (!customer.isUserProfileCompleted()) {
            return new ApiResponse<>(false, "Complete profile first!", customer);
        }

        if (customer.isSpinWheelCompleted()) {
            return new ApiResponse<>(false, "Spin already completed!", customer);
        }

        List<WheelSliceDto> allSlices = customer.getServiceStatus() == 1 ?
                wheelSliceClient.getYesSlices() :
                wheelSliceClient.getInterestedSlices();

        if (allSlices == null || allSlices.isEmpty()) {
            return new ApiResponse<>(false, "Wheel slices not configured!", customer);
        }

        WheelSliceDto winningSlice;
        if (dto.getRewardId() != null && !dto.getRewardId().isBlank()) {
            winningSlice = allSlices.stream()
                    .filter(s -> s.getId().equals(dto.getRewardId()))
                    .findFirst()
                    .orElse(null);
            if (winningSlice == null) {
                return new ApiResponse<>(false, "Invalid rewardId!", customer);
            }
        } else {
            if (customer.getServiceStatus() == 1) {
                Integer rank = customer.getRegistrationRank();
                if (rank == null) rank = Integer.MAX_VALUE;
                winningSlice = rank <= 500 ? allSlices.get(0) : allSlices.get(Math.min(6, allSlices.size() - 1));
            } else {
                int randomIndex = (int) (Math.random() * allSlices.size());
                winningSlice = allSlices.get(randomIndex);
            }
        }

        customer.setSpinRewardId(winningSlice.getId());
        customer.setSpinRewardValue(winningSlice.getOption());
        customer.setSpinRewardImage(winningSlice.getSrc());
        customer.setSpinWheelCompleted(true);
        customerRepository.save(customer);

        return new ApiResponse<>(true, "Spin completed successfully!", customer);
    }


 // ==================== STEP 3: Complete Registration ====================
    @Transactional
    public ApiResponse<Customer> completeRegistrationByMobile(String mobile, CompleteRegistrationDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));

        if (!customer.isSpinWheelCompleted())
            return new ApiResponse<>(false, "Complete Spin Wheel first!", customer);

        // Only address is relevant now
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


 // ==================== GET WHEEL SLICES ====================
    public ApiResponse<Map<String, Object>> getWheelSlices(String mobile) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));

        List<WheelSliceDto> allSlices;
        if (customer.getServiceStatus() == 1) {
            allSlices = wheelSliceClient.getYesSlices();
        } else if (customer.getServiceStatus() == 2) {
            allSlices = wheelSliceClient.getInterestedSlices();
        } else {
            return new ApiResponse<>(false, "Invalid service status", null);
        }

        if (allSlices == null || allSlices.isEmpty()) {
            return new ApiResponse<>(false, "Wheel slices not configured", null);
        }

        WheelSliceDto winningSlice;

        // 🎯 If spin already completed → Always return the stored result
        if (customer.isSpinWheelCompleted() && customer.getSpinRewardId() != null) {
            winningSlice = allSlices.stream()
                    .filter(s -> s.getId().equals(customer.getSpinRewardId()))
                    .findFirst()
                    .orElse(allSlices.get(0));
        } 
        else {
            // 🎯 First time → decide winner RANDOMLY but in allowed range
            if (customer.getServiceStatus() == 1) {
                // YES USERS
                Integer rank = customer.getRegistrationRank();
                if (rank == null) rank = Integer.MAX_VALUE;

                if (rank <= 500) {
                    // ⭐ HIGH-VALUE USERS → RANDOM BETWEEN INDEX 0–5
                    int randomIndex = (int) (Math.random() * 6); // 0–5
                    winningSlice = allSlices.get(randomIndex);
                } else {
                    // ⭐ LOW-VALUE USERS → RANDOM BETWEEN INDEX 6–11
                    int min = 6;
                    int max = allSlices.size(); // exclusive
                    int randomIndex = min + (int)(Math.random() * (max - min)); // 6–11
                    winningSlice = allSlices.get(randomIndex);
                }
            } 
            else {
                // INTERESTED USERS → RANDOM BETWEEN 0–11
                int randomIndex = (int) (Math.random() * allSlices.size());
                winningSlice = allSlices.get(randomIndex);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("allSlices", allSlices);
        response.put("winningSliceId", winningSlice.getId());

        return new ApiResponse<>(true, "Wheel slices fetched successfully", response);
    }





 // ==================== CRUD ====================
    public ApiResponse<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();

        // Filter only those customers where userProfileCompleted is true
        List<Customer> completedUsers = customers.stream()
                .filter(Customer::isUserProfileCompleted)
                .toList(); // or collect(Collectors.toList()) in older Java

        if (completedUsers.isEmpty()) 
            return new ApiResponse<>(false, "No completed customers found", null);

        return new ApiResponse<>(true, "Completed customers retrieved successfully", completedUsers);
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

        // ✅ Common mandatory fields
        if (isEmpty(dto.getCity())) missingFields.add("city");
        if (isEmpty(dto.getGender())) missingFields.add("gender");

        // Service-specific fields
        if (dto.getServiceStatus() == 1) {
            if (isEmpty(dto.getClinicName())) missingFields.add("clinicName");
            if (isEmpty(dto.getClinicCityArea())) missingFields.add("clinicCityArea");
            if (dto.getDateOfLastVisit() == null) missingFields.add("dateOfLastVisit");
            if (isEmpty(dto.getServiceType())) missingFields.add("serviceType");
            if (isEmpty(dto.getPrescription())) missingFields.add("prescription");
        } 
        else if (dto.getServiceStatus() == 2) {
            if (isEmpty(dto.getCategory())) missingFields.add("category");
            if (isEmpty(dto.getConcern())) missingFields.add("concern");
            if (isEmpty(dto.getSkinTone())) missingFields.add("skinTone");
        } 
        else {
            throw new InvalidInputException("Invalid serviceStatus value");
        }

        // Consent checks
        if (dto.getAadhaarConsent() == null || !dto.getAadhaarConsent()) missingFields.add("aadhaarConsent");
        if (dto.getUserConsent() == null || !dto.getUserConsent()) missingFields.add("userConsent");
        if (dto.getPrivacyConsent() == null || !dto.getPrivacyConsent()) missingFields.add("privacyConsent");

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
        customer.setCity(dto.getCity());
        customer.setDob(dto.getDob());
        customer.setRegistrationCode(dto.getRegistrationCode());
        customer.setReferBy(dto.getReferBy());
        customer.setServiceStatus(dto.getServiceStatus());
        customer.setGender(dto.getGender());

        // New consents
        customer.setAadhaarConsent(dto.getAadhaarConsent());
        customer.setUserConsent(dto.getUserConsent());
        customer.setPrivacyConsent(dto.getPrivacyConsent());

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
        String last4 = AadhaarUtils.getLast4Digits(aadhaar);

        List<Customer> candidates = customerRepository.findByAadharPreHashIn(List.of(preHash));

        for (Customer c : candidates) {
            if (Objects.equals(c.getMobile(), excludeMobile)) continue;

            if (c.getAadharHash() != null && c.getAadharSalt() != null) {
                String computedHash = AadhaarUtils.hashAadhaar(aadhaar, c.getAadharSalt());
                if (AadhaarUtils.constantTimeEquals(computedHash, c.getAadharHash())) {
                    throw new DuplicateAadhaarException("Aadhaar number already exists");
                }
            } else {
                // fallback: legacy pre-hash check
                if (c.getAadharPreHash().equals(AadhaarUtils.secureLegacyPreHash(last4, c.getAadharSalt()))) {
                    throw new DuplicateAadhaarException("Aadhaar number already exists (legacy user)");
                }
            }
        }
    }

}
