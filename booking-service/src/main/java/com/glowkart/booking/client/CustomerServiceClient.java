package com.glowkart.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.CustomerDTO;

@FeignClient(name = "customer-service")
public interface CustomerServiceClient {
    @GetMapping("/api/customer/id/{customerId}")
    ApiResponse<CustomerDTO> getCustomerId(@PathVariable String customerId);
}
