package com.glowkart.admin.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.CustomerResponseDTO;

@FeignClient(name = "customer-service")
public interface CustomerServiceClient {

    @GetMapping("/api/customer/all")
    ApiResponse<List<CustomerResponseDTO>> getAllCustomers();

    @GetMapping("/api/customer/{mobile}")
    ApiResponse<CustomerResponseDTO> getCustomer(@PathVariable("mobile") String mobile);

    @DeleteMapping("/api/customer/{mobile}")
    ApiResponse<String> deleteCustomer(@PathVariable("mobile") String mobile);
}
