package com.glowkart.customer.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.WheelSliceDto;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.service.CustomerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
// @CrossOrigin("*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // ==================== STEP-1: Register Customer ====================
    @PostMapping("/customer/register")
    public ResponseEntity<ApiResponse<Customer>> registerCustomer(
            @RequestBody @Valid CustomerDetailsDTO dto) {
        ApiResponse<Customer> response = customerService.saveCustomer(dto);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // ==================== STEP-1: Update Customer ====================
    @PutMapping("/customer/{mobile}/step1")
    public ResponseEntity<ApiResponse<Customer>> updateStep1(
            @PathVariable String mobile,
            @RequestBody @Valid CustomerDetailsDTO dto) {
        try {
            ApiResponse<Customer> response = customerService.updateStep1(mobile, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // ==================== STEP-2: Complete/Update Registration ====================
    @PutMapping("/customer/{mobile}/step2")
    public ResponseEntity<ApiResponse<Customer>> completeRegistration(
            @PathVariable String mobile,
            @RequestBody @Valid CompleteRegistrationDTO dto) {
        try {
            ApiResponse<Customer> response = customerService.completeRegistration(mobile, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // ==================== GET Wheel Slices ====================
    @GetMapping("/customer/wheel-slices")
    public ResponseEntity<ApiResponse<List<WheelSliceDto>>> getWheelSlices() {
        ApiResponse<List<WheelSliceDto>> response = customerService.getWheelSlices();
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NO_CONTENT).body(response);
    }

    // ==================== GET All Customers ====================
    @GetMapping("/customer/all")
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers() {
        ApiResponse<List<Customer>> response = customerService.getAllCustomers();
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NO_CONTENT).body(response);
    }

    // ==================== GET Single Customer ====================
    @GetMapping("/customer/{mobile}")
    public ResponseEntity<ApiResponse<Customer>> getCustomer(@PathVariable String mobile) {
        ApiResponse<Customer> response = customerService.getCustomer(mobile);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // ==================== DELETE Customer ====================
    @DeleteMapping("/customer/{mobile}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable String mobile) {
        ApiResponse<String> response = customerService.deleteCustomer(mobile);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}

