package com.glowkart.customer.service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
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
import com.glowkart.customer.dto.CityRequestDTO;
import com.glowkart.customer.dto.CityResponseDTO;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.dto.WalletSummaryDTO;
import com.glowkart.customer.dto.WheelSliceDto;
import com.glowkart.customer.exception.CustomerNotFoundException;
import com.glowkart.customer.exception.DuplicateAadhaarException;
import com.glowkart.customer.exception.DuplicateMobileException;
import com.glowkart.customer.exception.InvalidInputException;
import com.glowkart.customer.feign.AdminCityClient;
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
    private AdminCityClient adminCityClient;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private RewardService rewardService;

    @Autowired
    private RewardQueryService rewardQueryService;

    /**
     * Save or update a Customer entity.
     */
    @Transactional
    public Customer saveCustomerEntity(Customer customer) {
        return customerRepository.save(customer);
    }
    // ==================== STEP 1: Save Customer ====================
    @Transactional
    public ApiResponse<Customer> saveCustomer(CustomerDetailsDTO dto) {
        // Fetch the customer by the registration code (existing functionality)
        Customer customer = customerRepository.findByRegistrationCode(dto.getRegistrationCode());
        if (customer == null) {
            log.warn("Invalid registration code: {}", dto.getRegistrationCode());
            throw new CustomerNotFoundException("Invalid user session");
        }

        if (!customer.isRegistrationCodeVerified()) {
            return new ApiResponse<>(false, "Verify registration code first", customer);
        }

        // Check for duplicates and validation (existing functionality)
        checkDuplicateMobile(dto.getMobile(), customer.getMobile());
        checkDuplicateAadhar(dto.getAadharNumber(), customer.getMobile());

        List<String> missingFields = validateStep1Fields(dto);
        if (!missingFields.isEmpty()) {
            return new ApiResponse<>(false,
                    "Missing required fields: " + String.join(", ", missingFields), null);
        }

        // ==================== City Handling ====================
        if (!cityExists(dto.getCity())) {
            log.info("New city '{}' detected. Saving to admin-service.", dto.getCity());
            try {
                CityRequestDTO cityRequest = new CityRequestDTO(dto.getCity());
                adminCityClient.addCity(cityRequest);
            } catch (Exception e) {
                log.error("Failed to save new city '{}' to admin-service: {}", dto.getCity(), e.getMessage());
            }
        } else {
            log.info("City '{}' already exists in admin-service.", dto.getCity());
        }

        // ==================== Generate Unique ReferId ====================
        generateAndSetReferId(customer);  // Generate and set the referId

        // Copy the data from DTO to customer object
        copyStep1Fields(dto, customer);

        customer.setUserProfileCompleted(true);
        customerRepository.save(customer);

        log.info("Step-1 completed for mobile: {}", customer.getMobile());
        return new ApiResponse<>(true, "Step-1 completed. Please proceed to the next step.", customer);
    }

    // Generate and set referId to customer
    private void generateAndSetReferId(Customer customer) {
        String referId;
        do {
            // Generate referId in the format "NGK-" followed by a random 6-character string
            referId = "NGK-" + generateRandomString(6);
        } while (customerRepository.findByReferId(referId) != null);  // Ensure it's unique by checking DB
        
        customer.setReferId(referId);  // Set the unique referId for the customer
    }

    // Helper method to generate a random alphanumeric string of the specified length
    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder stringBuilder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            stringBuilder.append(chars.charAt(index));
        }
        return stringBuilder.toString();
    }

    // ==================== GET DISTINCT CITIES (FROM ADMIN-SERVICE) ====================
    public List<String> getDistinctCities() {
        ApiResponse<List<CityResponseDTO>> response = adminCityClient.getAllCities();

        if (!response.isSuccess() || response.getData() == null) {
            log.warn("Failed to fetch cities from admin-service. Returning empty list.");
            return Collections.emptyList();
        }

        return response.getData().stream()
                .map(CityResponseDTO::getName)
                .filter(name -> name != null && !name.trim().isEmpty())
                .map(String::trim)
                .map(String::toLowerCase)
                .distinct()
                .sorted()
                .map(city -> Character.toUpperCase(city.charAt(0)) + city.substring(1))
                .collect(Collectors.toList());
    }

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
            // Centralized winning slice logic
            winningSlice = determineWinningSlice(customer, allSlices);
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
    public ApiResponse<Map<String, Object>> completeRegistrationByMobile(
            String mobile,
            CompleteRegistrationDTO dto) {

        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found"));

        if (!customer.isSpinWheelCompleted()) {
            return new ApiResponse<>(false, "Complete Spin Wheel first!", null);
        }

        if (customer.isRegistrationCompleted()) {
            return new ApiResponse<>(false, "Registration already completed", null);
        }

        // Save address and mark registration complete
        customer.setAddress(dto.getAddress());
        customer.setRegistrationCompleted(true);

        // 🎁 Apply registration reward
        rewardService.applyRegistrationReward(customer);

        customerRepository.save(customer);

        // Mark registration code as used
        try {
            registrationService.markCodeUsed(customer.getRegistrationCode());
        } catch (Exception e) {
            log.error("Failed to mark code as used: {}", e.getMessage());
        }

        // Fetch wallet summary
        WalletSummaryDTO walletSummary = rewardQueryService.getWalletSummary(customer.getMobile());

        // Prepare combined response
        Map<String, Object> responseData = Map.of(
                "customer", customer,
                "walletSummary", walletSummary
        );

        return new ApiResponse<>(
                true,
                "Registration completed successfully! 100 points credited",
                responseData
        );
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

        // Centralized winning slice logic
        WheelSliceDto winningSlice = determineWinningSlice(customer, allSlices);

        Map<String, Object> response = new HashMap<>();
        response.put("allSlices", allSlices);
        response.put("winningSliceId", winningSlice.getId());

        return new ApiResponse<>(true, "Wheel slices fetched successfully", response);
    }


 // ==================== HELPER: DETERMINE WINNING SLICE ====================
    private WheelSliceDto determineWinningSlice(Customer customer, List<WheelSliceDto> allSlices) {
        if (allSlices == null || allSlices.isEmpty()) return null;

        // If already spun, return stored reward
        if (customer.isSpinWheelCompleted() && customer.getSpinRewardId() != null) {
            return allSlices.stream()
                    .filter(s -> s.getId().equals(customer.getSpinRewardId()))
                    .findFirst()
                    .orElse(allSlices.get(0));
        }

        // First-time spin logic
        if (customer.getServiceStatus() == 1) {
            // YES USERS
            if ("male".equalsIgnoreCase(customer.getGender())) {
                // Male YES users → only slices 10,11,12 (indexes 9,10,11)
                int[] allowedIndexes = {9, 10, 11};
                int randomIndex = allowedIndexes[(int) (Math.random() * allowedIndexes.length)];
                return allSlices.get(randomIndex);
            } else {
                // Female YES users → rank-based logic
                Integer rank = customer.getRegistrationRank();
                if (rank == null) rank = Integer.MAX_VALUE;

                if (rank <= 500) {
                    int randomIndex = (int) (Math.random() * 6); // 0–5
                    return allSlices.get(randomIndex);
                } else {
                    int min = 6;
                    int max = allSlices.size(); // exclusive
                    int randomIndex = min + (int) (Math.random() * (max - min)); // 6–11
                    return allSlices.get(randomIndex);
                }
            }
        } else if (customer.getServiceStatus() == 2) {
            // INTERESTED USERS
            if ("male".equalsIgnoreCase(customer.getGender())) {
                // Male INTERESTED users → only slices 4,5,6 (indexes 3,4,5) and 10,11,12 (indexes 9,10,11)
                int[] allowedIndexes = {3, 4, 5, 9, 10, 11};
                int randomIndex = allowedIndexes[(int) (Math.random() * allowedIndexes.length)];
                return allSlices.get(randomIndex);
            } else {
                // Female INTERESTED users → random between all slices
                int randomIndex = (int) (Math.random() * allSlices.size());
                return allSlices.get(randomIndex);
            }
        } else {
            // Fallback: random between all slices
            int randomIndex = (int) (Math.random() * allSlices.size());
            return allSlices.get(randomIndex);
        }
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
     // ==================== Normalize city ====================
        if (dto.getCity() != null && !dto.getCity().isBlank()) {
            String normalizedCity = dto.getCity().trim().toLowerCase();
            normalizedCity = Character.toUpperCase(normalizedCity.charAt(0)) + normalizedCity.substring(1);
            customer.setCity(normalizedCity);
        } else {
            customer.setCity(null);
        }
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
