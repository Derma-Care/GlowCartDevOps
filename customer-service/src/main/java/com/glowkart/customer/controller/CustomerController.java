package com.glowkart.customer.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.dto.WheelSliceDto;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.service.CustomerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
//@CrossOrigin("*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // ==================== STEP-1 ====================
    @PostMapping("/customer/step1")
    public ResponseEntity<ApiResponse<Customer>> saveCustomer(
            @RequestBody @Valid CustomerDetailsDTO dto) {

        ApiResponse<Customer> response = customerService.saveCustomer(dto);

        return ResponseEntity.status(
                response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST
        ).body(response);
    }

    // ==================== STEP-2 ====================
    @PostMapping("/customer/{mobile}/spin")
    public ResponseEntity<ApiResponse<Customer>> spinWheel(
            @PathVariable String mobile,
            @RequestBody @Valid SpinWheelDTO dto) {

        ApiResponse<Customer> response = customerService.completeSpinByMobile(mobile, dto);

        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ==================== STEP-3 ====================
    @PostMapping("/customer/{mobile}/complete")
    public ResponseEntity<ApiResponse<Customer>> completeRegistration(
            @PathVariable String mobile,
            @RequestBody @Valid CompleteRegistrationDTO dto) {

        ApiResponse<Customer> response = customerService.completeRegistrationByMobile(mobile, dto);

        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ==================== GET Wheel Slices ====================
    @GetMapping("/customer/wheel-slices")
    public ResponseEntity<ApiResponse<List<WheelSliceDto>>> getWheelSlices() {
        ApiResponse<List<WheelSliceDto>> response = customerService.getWheelSlices();
        return ResponseEntity.ok(response);
    }

    // ==================== GET All Customers ====================
    @GetMapping("/customer/all")
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
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
