//package com.glowkart.auth.controller;
//
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.glowkart.auth.dto.ApiResponse;
//import com.glowkart.auth.dto.CompleteRegistrationDTO;
//import com.glowkart.auth.dto.CustomerDetailsDTO;
//import com.glowkart.auth.dto.ReferralRegistrationDTO;
//import com.glowkart.auth.dto.SpinWheelDTO;
//import com.glowkart.auth.exception.InvalidInputException;
//import com.glowkart.auth.model.Customer;
//import com.glowkart.auth.repo.CustomerRepository;
//import com.glowkart.auth.service.CustomerService;
//
//import jakarta.validation.Valid;
//import org.springframework.util.StringUtils;
//
//@RestController
//@RequestMapping("/api")
////@CrossOrigin("*")
//public class CustomerController {
//
//    @Autowired
//    private CustomerService customerService;
//    
//    @Autowired
//    private CustomerRepository customerRepository;
//
//
//    // ==================== STEP 1 ====================
//    @PostMapping("/customer/step1")
//    public ResponseEntity<ApiResponse<Customer>> step1(@RequestBody @Valid CustomerDetailsDTO dto) {
//        ApiResponse<Customer> response = customerService.saveCustomer(dto);
//        return ResponseEntity.status(response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
//                .body(response);
//    }
//
// // ==================== STEP 2: Spin Wheel ====================
//    @PostMapping("/customer/{mobile}/spin")
//    public ResponseEntity<ApiResponse<Customer>> step2(
//            @PathVariable String mobile,
//            @RequestBody(required = false) SpinWheelDTO dto) { // optional DTO
//        if (dto == null) dto = new SpinWheelDTO(); // allow empty DTO
//        ApiResponse<Customer> response = customerService.completeSpinByMobile(mobile, dto);
//        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
//                .body(response);
//    }
//
//
//
//    // ==================== STEP 3 ====================
//    @PostMapping("/customer/{mobile}/complete")
//    public ResponseEntity<ApiResponse<Map<String, Object>>> step3(
//            @PathVariable String mobile,
//            @RequestBody @Valid CompleteRegistrationDTO dto) {
//
//        ApiResponse<Map<String, Object>> response = customerService.completeRegistrationByMobile(mobile, dto);
//
//        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
//                .body(response);
//    }
//
//
//    // ==================== GET Wheel Slices ====================
//    @GetMapping("/customer/{mobile}/wheel-slices")
//    public ResponseEntity<ApiResponse<Map<String, Object>>> getWheelSlices(@PathVariable String mobile) {
//        ApiResponse<Map<String, Object>> response = customerService.getWheelSlices(mobile);
//        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
//                .body(response);
//    }
//
//
//    // ==================== CRUD ====================
//    @GetMapping("/customer/all")
//    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers() {
//        return ResponseEntity.ok(customerService.getAllCustomers());
//    }
//
//    @GetMapping("/customer/{mobile}")
//    public ResponseEntity<ApiResponse<Customer>> getCustomer(@PathVariable String mobile) {
//        ApiResponse<Customer> response = customerService.getCustomer(mobile);
//        return response.isSuccess() ? ResponseEntity.ok(response)
//                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//    }
//    
//    @GetMapping("/customer/id/{customerId}")
//    public ResponseEntity<ApiResponse<Customer>> getCustomerId(@PathVariable String customerId) {
//        ApiResponse<Customer> response = customerService.getCustomerById(customerId);
//        return response.isSuccess() ? ResponseEntity.ok(response)
//                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//    }
//    
//    // ==================== GET Customer by Registration Code ====================
//    @GetMapping("/customer/code/{registrationCode}")
//    public ResponseEntity<ApiResponse<Customer>> getCustomerByCode(@PathVariable String registrationCode) {
//        ApiResponse<Customer> response = customerService.getCustomerByRegistrationCode(registrationCode);
//        return response.isSuccess() ? ResponseEntity.ok(response)
//                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//    }
//
//    // New endpoint to get all distinct cities
//    @GetMapping("/customer/cities")
//    public ResponseEntity<ApiResponse<List<String>>> getCities() {
//        List<String> cities = customerService.getDistinctCities();
//        return ResponseEntity.ok(new ApiResponse<>(true, "Cities fetched successfully", cities));
//    }
//    
//    @DeleteMapping("/customer/{mobile}")
//    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable String mobile) {
//        ApiResponse<String> response = customerService.deleteCustomer(mobile);
//        return response.isSuccess() ? ResponseEntity.ok(response)
//                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//    }
//    
//    @GetMapping("/customer/referral/{referId}/validate")
//    public ApiResponse<String> validateReferral(@PathVariable String referId) {
//        return customerRepository.findByReferId(referId)
//            .map(c -> new ApiResponse<>(true, "Valid referral ID", c.getFullName()))
//            .orElse(new ApiResponse<>(false, "Invalid referral ID", null));
//    }
//
// // ==================== REGISTER & COMPLETE IN ONE GO ====================
////    @PostMapping("/customer/register-and-complete")
////    public ResponseEntity<ApiResponse<Map<String, Object>>> registerAndComplete(
////            @RequestBody @Valid CustomerRegisterDTO dto) {
////
////        ApiResponse<Map<String, Object>> response = customerService.registerAndComplete(dto);
////        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
////                .body(response);
////    }
//
//    @GetMapping("/customer/referral/{referId}/verify")
//    public ResponseEntity<ApiResponse<Void>> verifyReferId(
//            @PathVariable String referId) {
//
//        if (referId == null || referId.isEmpty()) {
//            return ResponseEntity.ok(
//                    new ApiResponse<>(true, "No referral ID provided, skipping verification", null)
//            );
//        }
//
//        customerService.verifyReferId(referId);
//        return ResponseEntity.ok(
//                new ApiResponse<>(true, "Referral ID verified successfully", null)
//        );
//    }
//
//
//    
//
//    // Optional referral verification endpoint
//    @PostMapping("/customerv/referral/verify")
//    public ResponseEntity<ApiResponse<Void>> verifyReferId(
//            @RequestBody Map<String, String> body) {
//
//        String referId = body.get("referId");
//        if (!StringUtils.hasText(referId)) {
//            throw new InvalidInputException("referId is required for verification");
//        }
//
//        customerService.verifyReferId(referId);
//        return ResponseEntity.ok(
//                new ApiResponse<>(true, "Referral ID verified successfully", null)
//        );
//    }
//
//    // Register customer (referId optional)
//    @PostMapping("/customer/referral/register")
//    public ResponseEntity<ApiResponse<Map<String, Object>>> registerViaReferral(
//            @RequestBody @Valid ReferralRegistrationDTO dto) {
//
//        return ResponseEntity.ok(
//                customerService.registerCustomerViaReferral(dto.getReferId(), dto)
//        );
//    }
//
//}
