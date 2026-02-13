package com.glowkart.admin.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.CustomerResponseDTO;
import com.glowkart.admin.dto.RewardTransactionDTO;
import com.glowkart.admin.service.AdminCustomerService;



@RestController
@RequestMapping("/admin")
public class AdminCustomerController {

    @Autowired
    private AdminCustomerService adminCustomerService;

    @GetMapping("/customers/all")
    public ResponseEntity<ApiResponse<List<CustomerResponseDTO>>> getAllCustomers() {
        // Get the list directly from the service
        List<CustomerResponseDTO> customers = adminCustomerService.getAllCustomers();

        // Wrap in ApiResponse dynamically
        ApiResponse<List<CustomerResponseDTO>> response = new ApiResponse<>(
                !customers.isEmpty(),                               // success = true if list not empty
                customers.isEmpty() ? "No customers found" : "Customers retrieved successfully",
                customers
        );

        // Return HTTP 200 OK regardless, or 404 if you prefer
        return ResponseEntity.ok(response);
    }


    @GetMapping("/customers/{mobile}")
    public ResponseEntity<ApiResponse<CustomerResponseDTO>> getCustomer(@PathVariable String mobile) {
        CustomerResponseDTO customer = adminCustomerService.getCustomerByMobile(mobile);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer retrieved successfully", customer));
    }

    @DeleteMapping("/customers/{mobile}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable String mobile) {
        adminCustomerService.deleteCustomer(mobile);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer deleted successfully", mobile));
    }
    
    
 // =================== Transactions ===================
    @GetMapping("/customers/{mobile}/reward-transactions")
    public ResponseEntity<ApiResponse<List<RewardTransactionDTO>>> getTransactions(
            @PathVariable String mobile,
            @RequestParam(value = "filter", defaultValue = "all") String filter) {

        List<RewardTransactionDTO> transactions =
                adminCustomerService.getTransactions(mobile, filter);

        ApiResponse<List<RewardTransactionDTO>> response =
                ApiResponse.<List<RewardTransactionDTO>>builder()
                        .success(true)
                        .message("Transactions fetched successfully")
                        .data(transactions)
                        .build();

        return ResponseEntity.ok(response);
    }
}
