package com.glowkart.customer.feign;


import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.customer.dto.WheelSliceDto;

@FeignClient(name = "admin-service", contextId = "wheelSliceClient")
public interface WheelSliceClient {

    @GetMapping("/admin/api/wheel-slices")
    List<WheelSliceDto> getAllSlices();

    @GetMapping("/admin/api/wheel-slices/{id}")
    WheelSliceDto getSliceById(@PathVariable String id);
}
