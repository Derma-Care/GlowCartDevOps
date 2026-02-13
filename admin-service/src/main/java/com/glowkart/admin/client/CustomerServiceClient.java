package com.glowkart.admin.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.CustomerResponseDTO;
import com.glowkart.admin.dto.RewardTransactionDTO;

@FeignClient(name = "customer-service",url = "http://3.111.202.212:8080")
public interface CustomerServiceClient {

    @GetMapping("/api/customer/all")
    ApiResponse<List<CustomerResponseDTO>> getAllCustomers();

    @GetMapping("/api/customer/{mobile}")
    ApiResponse<CustomerResponseDTO> getCustomer(@PathVariable("mobile") String mobile);

    @DeleteMapping("/api/customer/{mobile}")
    ApiResponse<String> deleteCustomer(@PathVariable("mobile") String mobile);
    
    //list of reward_transactions
    @GetMapping("/api/rewards/{mobile}/transactions")
    ApiResponse<List<RewardTransactionDTO>> getTransactions(
            @PathVariable("mobile") String mobile,
            @RequestParam(value = "filter", required = false, defaultValue = "all") String filter
    );

}
