package com.glowkart.customer.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.customer.dto.WheelSliceDto;

@FeignClient(name = "admin-service", contextId = "wheelSliceClient")
public interface WheelSliceClient {

    // Fetch YES wheel slices
    @GetMapping("/admin/api/wheel-slices/yes")
    List<WheelSliceDto> getYesSlices();

    // Fetch INTERESTED wheel slices
    @GetMapping("/admin/api/wheel-slices/interested")
    List<WheelSliceDto> getInterestedSlices();

    // Fetch slice by ID (generic)
    @GetMapping("/admin/api/wheel-slices/yes/{id}")
    WheelSliceDto getYesSliceById(@PathVariable String id);

    @GetMapping("/admin/api/wheel-slices/interested/{id}")
    WheelSliceDto getInterestedSliceById(@PathVariable String id);
}
