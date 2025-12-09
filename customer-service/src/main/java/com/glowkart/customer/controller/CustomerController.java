package com.glowkart.customer.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.service.CustomerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
//@CrossOrigin("*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // ==================== STEP 1 ====================
    @PostMapping("/customer/step1")
    public ResponseEntity<ApiResponse<Customer>> step1(@RequestBody @Valid CustomerDetailsDTO dto) {
        ApiResponse<Customer> response = customerService.saveCustomer(dto);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
                .body(response);
    }

 // ==================== STEP 2: Spin Wheel ====================
    @PostMapping("/customer/{mobile}/spin")
    public ResponseEntity<ApiResponse<Customer>> step2(
            @PathVariable String mobile,
            @RequestBody(required = false) SpinWheelDTO dto) { // optional DTO
        if (dto == null) dto = new SpinWheelDTO(); // allow empty DTO
        ApiResponse<Customer> response = customerService.completeSpinByMobile(mobile, dto);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
                .body(response);
    }



    // ==================== STEP 3 ====================
    @PostMapping("/customer/{mobile}/complete")
    public ResponseEntity<ApiResponse<Customer>> step3(
            @PathVariable String mobile,
            @RequestBody @Valid CompleteRegistrationDTO dto) {

        ApiResponse<Customer> response = customerService.completeRegistrationByMobile(mobile, dto);

        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // ==================== GET Wheel Slices ====================
    @GetMapping("/customer/{mobile}/wheel-slices")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWheelSlices(@PathVariable String mobile) {
        ApiResponse<Map<String, Object>> response = customerService.getWheelSlices(mobile);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
                .body(response);
    }


    // ==================== CRUD ====================
    @GetMapping("/customer/all")
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/customer/{mobile}")
    public ResponseEntity<ApiResponse<Customer>> getCustomer(@PathVariable String mobile) {
        ApiResponse<Customer> response = customerService.getCustomer(mobile);
        return response.isSuccess() ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    // ==================== GET Customer by Registration Code ====================
    @GetMapping("/customer/code/{registrationCode}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerByCode(@PathVariable String registrationCode) {
        ApiResponse<Customer> response = customerService.getCustomerByRegistrationCode(registrationCode);
        return response.isSuccess() ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // New endpoint to get all distinct cities
    @GetMapping("/customer/cities")
    public ResponseEntity<ApiResponse<List<String>>> getCities() {
        List<String> cities = customerService.getDistinctCities();
        return ResponseEntity.ok(new ApiResponse<>(true, "Cities fetched successfully", cities));
    }
    
    @DeleteMapping("/customer/{mobile}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable String mobile) {
        ApiResponse<String> response = customerService.deleteCustomer(mobile);
        return response.isSuccess() ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
