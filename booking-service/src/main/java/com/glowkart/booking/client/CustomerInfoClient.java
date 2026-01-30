package com.glowkart.booking.client;

import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.CustomerDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "customer-service", contextId = "customerInfoClient",url = "http://3.111.202.212:8080")
public interface CustomerInfoClient {

    @GetMapping("/api/customer/id/{customerId}")
    ApiResponse<CustomerDTO> getCustomerId(@PathVariable("customerId") String customerId);
}
