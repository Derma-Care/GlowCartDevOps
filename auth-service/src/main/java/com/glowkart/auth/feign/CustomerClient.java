package com.glowkart.auth.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.glowkart.auth.model.Customer;

@FeignClient(name = "customer-service", url = "http://3.111.202.212:8080")
public interface CustomerClient {

    @GetMapping("/api/customer/{mobile}")
    Customer getCustomer(@PathVariable String mobile);

    @PutMapping("/api/customer/{mobile}/device-token")
    void updateDeviceToken(@PathVariable String mobile,
                           @RequestParam String deviceToken);
}

